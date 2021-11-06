import Link from 'next/link';

const DemoTwo = () => {
  return (
    <>
      <h1>This is page two</h1>
      <p>Some text goes here maybe?</p>
      <Link href='/demo-one'>Click to move</Link>
    </>
  )
}

export default DemoTwo;