import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { AnimatePresence, usePresence } from 'framer-motion';

import styles from '../styles/Transition.module.css';
import '../styles/globals.css';

const SlidingWrapper = ({ Component, pageProps }: AppProps) => {
  const [ isNew, setIsNew ] = useState(true);
  useEffect(() => setIsNew(false), []);
  const [ isPresent, safeToRemove ] = usePresence();

  const classes = [
    styles.normal,
    isNew ? styles.entering : undefined,
    isPresent ? undefined : styles.exiting
  ].join(' ');

  const onComplete = () => {
    if (safeToRemove) {
      safeToRemove();
    }
  }

  return (
    <div
      className={classes}
      onTransitionEnd={onComplete}
    >
      <img
        src="/TransitionSlider.svg"
        alt="A sleigh pulled by reindeer, to make transitions smoother"
        className={styles.image}
      />
      <Component {...pageProps} />
    </div>
  );
};

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  return <>
    <Head>
      <title>Secret Santa</title>
      <link rel="icon" href="/Icon.png"/>
    </Head>
    <AnimatePresence>
      <SlidingWrapper key={router.route} pageProps={pageProps} Component={Component} router={router} />
    </AnimatePresence>
  </>;
};

export default MyApp;
