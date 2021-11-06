import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import '../styles/globals.css';


const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  return <>
    <Head>
      <title>Secret Santa</title>
      <link rel="icon" href="/Icon.png"/>
    </Head>
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          key={router.route}
          initial={{ x: '180vw', y: '56.4vw' }}
          animate={{ x: '0', y: 0 }}
          exit={{ x: '-100%', y: '-31.3vw' }}
          transition={{
            duration: 3,
            ease: 'linear'
          }}
        >
          <div style={{ top: '0', position: 'fixed' }}>
            <Component {...pageProps} />
            <img src="/TransitionSlider.svg" alt="A sleigh pulled by reindeers, to make transitions smoother"
                 style={{
                   position: 'fixed',
                   bottom: 'calc(100% - 3rem)',
                   right: 'calc(100% + 2ch)',
                   height: '15rem'
                 }}
            />
          </div>
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  </>;
};

export default MyApp;
