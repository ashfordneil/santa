import { formatDistanceToNow } from 'date-fns';
import { GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { withIronSessionSsr } from 'iron-session/next';
import useInterval from 'react-useinterval';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Paragraph from '@tiptap/extension-paragraph';
import History from '@tiptap/extension-history';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';

import { WishListRequest, WishListResponse } from 'boundaries/wish-list';
import { IronConfig } from 'config';
import { Button } from 'components/button';
import { ErrorMessage } from 'components/error-wrapper';
import { getDb } from 'migrations';
import { request } from 'util/request';

import styles from '../styles/WishList.module.css';

interface Props {
  readonly [key: string]: unknown;
  readonly name: string;
  readonly wishList: string | null;
}

export const getServerSideProps = withIronSessionSsr(async (ctx): Promise<GetServerSidePropsResult<Props>> => {
  const user = ctx.req.session.id;
  if (user === undefined) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const db = getDb();
  const getName: undefined | { name: string, wish_list: string } = db.prepare('SELECT name, wish_list FROM Users WHERE id = ?').get(user);
  if (getName === undefined) {
    ctx.req.session.destroy();
    return { redirect: { destination: '/login', permanent: false } };
  }

  return {
    props: {
      name: getName.name,
      wishList: getName.wish_list
    }
  }
}, IronConfig)

const WishList: React.FC<Props> = props => {
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(Date.now);
  const [forceRender, setForceRender] = useState(false);
  useInterval(() => {
    setForceRender((old) => !old);
  }, isDirty ? 1000 : null);

  const editor = useEditor({
    extensions: [Document.extend({ content: 'list+' }), Text, Paragraph, History, BulletList, ListItem],
    content: props.wishList,
    onUpdate: () => {
      if (!isDirty) {
        setLastSaved(Date.now());
      }
      setIsDirty(true);
    }
  });

  const submitWishList = useAsyncCallback(async (html: string) => {
      await request<WishListRequest, typeof WishListResponse>('/api/wish-list', { html }, WishListResponse);
      setIsDirty(false);
      setLastSaved(Date.now());
  });

  if (!editor) {
    return null;
  }

  return (
    <form className={styles.page} onSubmit={(e) => { e.preventDefault(); submitWishList.execute(editor?.getHTML())}}>
      <h1>Welcome to Secret Santa, {props.name}</h1>
      <p className={styles.warning}>Are you not {props.name}? Click <Link href="/logout">here to log out!</Link></p>
      <p>Please enter your wish list below</p>
      {submitWishList.loading ? (
        <p>Loading...</p>
      ) : (
        <ErrorMessage clear={submitWishList.reset} error={submitWishList.error}>
          <EditorContent editor={editor} />
          <Button disabled={!isDirty} onClick="submit">
            Save ({isDirty ? <>last save {formatDistanceToNow(new Date(lastSaved))} ago</> : <>all content saved</>})
          </Button>
        </ErrorMessage>
      )}
      <p>Click <Link href="/">here to go back!</Link></p>
    </form>
  )
};

export default WishList;