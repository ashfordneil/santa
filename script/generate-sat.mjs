import {spawn} from "child_process";
import {mkdtemp, readFile, writeFile} from "fs";
import {tmpdir} from "os";
import {join, sep} from "path";
import {createInterface} from "readline";

import Database from "better-sqlite3";

const ui = createInterface(process.stdin, process.stdout);
const question = (query) => new Promise((resolve) => ui.question(query, resolve));

const getDb = async () => {
  const dbPath = await question("What is the path to the database? ");
  return new Database(dbPath, {fileMustExist: true});
};

const getGroup = async (db) => {
  const availableGroups = db.prepare("SELECT id, name FROM GiftExchangeGroup WHERE current_year IS NULL").all();
  if (availableGroups.length === 0) {
    throw new Error("All groups have been assigned this year.");
  }

  ui.write("Select one of the following groups to analyze:\n");
  availableGroups.forEach(group => {
    ui.write(`${group.id}: ${group.name}\n`);
  });
  const group = await question("Select a group: ");

  const users = db.prepare(
    "SELECT id, name FROM Users INNER JOIN GroupMembership GM on Users.id = GM.user WHERE GM.gift_exchange_group = ?"
  ).all(group);
  if (users.length === 0) {
    throw new Error("There are no users in this group.");
  }

  return [group, users];
};

const getYear = async (db, group) => {
  const { max_year } = db.prepare("SELECT max(year) AS max_year FROM Gift WHERE gift_exchange_group = ?").get(group);
  while (true) {
    const year = parseInt(await question("What year would you like to do allocations for? "));
    if (isNaN(year) || (max_year && year <= max_year)) {
      ui.write("This year is invalid.\n");
    } else {
      return year;
    }
  }
};

const atMostOne = (literals) => literals.flatMap((lit, i) =>
  literals.slice(i + 1).map((other) => [-lit, -other, 0])
);

const gameRules = (buysFor, users) => {
  const output = [];

  // Everyone gets one present
  users.forEach(user => {
    const potentialPairs = users.map(santa => buysFor(santa, user));
    output.push([ ...potentialPairs, 0 ]);
    output.push(...atMostOne(potentialPairs));
  });

  // Everyone gives one present
  users.forEach(santa => {
    const potentialPairs = users.map(user => buysFor(santa, user));
    output.push([ ...potentialPairs, 0 ]);
    output.push(...atMostOne(potentialPairs));
  });

  // Nobody buys for themselves
  users.forEach(user => output.push([ -buysFor(user, user), 0 ]));

  return output;
};

const lastYear = (db, group, users) => {
  const indexed = new Map();
  users.forEach((user, i) => indexed.set(user.id, i));

  const { last_year } = db.prepare("SELECT max(year) AS last_year FROM Gift WHERE gift_exchange_group = ?").get(group);
  const output = users.map(user => {
    const pastGifts = db.prepare("SELECT receiver FROM Gift WHERE giver = ? AND year >= ?").all(user.id, last_year);
    return pastGifts.map(({ receiver }) => indexed.get(receiver)).filter(x => x !== null);
  });

  return output;
};

const customRules = async (buysFor, users) => {
  const clauses = [];

  ui.write("The following users are available in this group:\n");
  users.forEach((user, i) => {
    ui.write(`${i}: ${user.name}\n`);
  });

  ui.write("Enter a list of space-separate user IDs to create a cluster, or done to move on.\n");
  while (true) {
    const group = await question("cluster> ");
    if (group === "done") {
      break;
    }

    const cluster = group.split(" ").map(x => parseInt(x));
    if (cluster.find(x => isNaN(x) || x < 0 || x >= users.length)) {
      ui.write("Please enter only valid numbers");
      continue;
    }

    cluster.forEach(santa => {
      clauses.push(...cluster.map(receiver => [ -buysFor(santa, receiver), 0]));
    });
  }

  return clauses;
}

const solveSat = async (clauses, maxVar) => {
  const directory = await new Promise((resolve, reject) => mkdtemp(tmpdir() + sep, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));

  const input = join(directory, "input.dimacs");
  const output = join(directory, "output.dimacs");

  const inputBody = [
    `p cnf ${maxVar} ${clauses.length}`,
    ...clauses.map(rule => rule.join(' '))
  ].join('\n');
  await new Promise((resolve, reject) => writeFile(input, inputBody, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));

  const solver = spawn("minisat", [input, output]);

  const exitCode = await new Promise(resolve => solver.on('exit', code => resolve(code)));

  if (exitCode === 20) {
    ui.write('This group is unsatisfiable.\n');
    return 1;
  } else if (exitCode !== 10) {
    ui.write('An unknown error occurred.\n');
    return 1;
  }

  const outputBody = await new Promise((resolve, reject) => readFile(output, 'utf-8', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));

  return outputBody.split('\n')[1].split(' ').map(x => parseInt(x)).filter(x => x > 0);
}

const exec = async () => {
  const db = await getDb();
  const [ group, users ] = await getGroup(db);
  const year = await getYear(db, group);

  // Encoding for SAT
  const satIds = users.map((_user, id) => id);
  const buysFor = (giver, receiver) => 1 + giver + users.length * receiver;
  const unwrap = atom => {
    const giver = (atom - 1) % users.length;
    const receiver = Math.floor((atom - 1) / users.length);
    return [ users[giver], users[receiver] ];
  };

  const notLastYear = lastYear(db, group, users).flatMap((receivers, santa) => receivers.map(receiver => [ -buysFor(santa, receiver), 0 ]));

  const clauses = [
    ...gameRules(buysFor, satIds),
    ...notLastYear,
    ...await customRules(buysFor, users)
  ];
  const positiveAtoms = await solveSat(clauses, users.length * users.length);

  positiveAtoms.forEach(atom => {
    const [ giver, receiver ] = unwrap(atom);
    db.prepare("INSERT INTO Gift (receiver, giver, gift_exchange_group, year) VALUES (?, ?, ?, ?)").run(receiver.id, giver.id, group, year);
  });
  db.prepare("UPDATE GiftExchangeGroup SET current_year = ? WHERE id = ?").run(year, group);

  return 0;
};

exec().then(process.exit, console.error).then(() => process.exit(-1));