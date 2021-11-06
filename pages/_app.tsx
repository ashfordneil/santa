import { AppProps } from 'next/app';
import Head from 'next/head';

import '../styles/globals.css';


const MyApp = ({ Component, pageProps }: AppProps) =>
  <>
    <Head>
      <title>Secret Santa</title>
      <link rel="icon" href="/Icon.png"/>
    </Head>
    <Component {...pageProps} />
  </>;

export default MyApp;
