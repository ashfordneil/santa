import Link from 'next/link';

const DemoOne = () => {
  return (
    <>
      <h1>This is page one</h1>
      <p>Some text goes here maybe?</p>
      <Link href='/demo-two'>Click to move</Link>
    </>
  )
}

export default DemoOne;
