import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { ErrorMessage } from 'components/error-wrapper';
import { Input, useInput } from 'components/input';
import { Button } from 'components/button';

import styles from '../styles/CreateUser.module.css';

interface UserInfo {
  readonly name: string;
  readonly phone: string;
}

interface OtpToken {
  readonly token: string;
  readonly otp: string;
}

const enum FormPhase {
  EnteringDetails,
  PhoneVerification
}

const fetchOtp = async (_data: UserInfo): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (Math.random() < 0.5) {
    throw new Error("The network died lol");
  }
  return 'token-me';
};

const fetchNewUser = async (_data: OtpToken): Promise<string> => {
  throw new Error('User creation not yet implemented');
};

const CreateUser: React.FC = () => {
  const name = useInput({
    validate: () => {
    }
  });
  const phone = useInput({
    validate: (ph) => {
      if (!ph.startsWith('04')) {
        return 'Please enter a valid phone number, starting with 04';
      }
    }
  });
  const otp = useInput({
    validate: (code) => {
      if (code.length !== 6) {
        return 'The code should be 6 digits long';
      }

      if (/[^0-9]/.test(code)) {
        return 'The code should only contain numbers';
      }
    }
  });

  const router = useRouter();
  const requestOtp = useAsyncCallback(fetchOtp);
  const submitOtp = useAsyncCallback(fetchNewUser);

  const phase = requestOtp.status === 'success' ? FormPhase.PhoneVerification : FormPhase.EnteringDetails;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    switch (phase) {
      case FormPhase.EnteringDetails:
        if (!name.validate() || !phone.validate()) {
          return;
        }

        requestOtp.execute({ name: name.value, phone: phone.value });
        break;
      case FormPhase.PhoneVerification:
        if (!otp.validate()) {
          return;
        }
        submitOtp.execute({ token: requestOtp.result!, otp: otp.value });
        break;
    }
  };

  const onReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    otp.setMessage(undefined);

    submitOtp.reset();
    requestOtp.reset();
  };

  useEffect(() => {
    if (submitOtp.status === 'success') {
      router.push('/');
    }
  }, [submitOtp.status]);

  const isLoading = requestOtp.loading || submitOtp.loading || submitOtp.status === 'success';

  return (
    <form onSubmit={onSubmit} onReset={onReset} className={styles.form}>
      <h1>Please enter your details</h1>
      <Input
        type="text" hook={name}
        label="Name"
        hint="Please enter your first and last name"

        readOnly={isLoading || phase === FormPhase.PhoneVerification}
        placeholder="Namey McNameface"
      />
      <Input
        type="tel" hook={phone}
        label="Phone"
        hint="Please enter your mobile phone number (for ID verification)"

        readOnly={isLoading || phase === FormPhase.PhoneVerification}
        placeholder="0412 345 678"
      />
      {phase === FormPhase.EnteringDetails ? (
        <>
          <ErrorMessage error={requestOtp.error} clear={requestOtp.reset}>
            <Button onClick="submit" disabled={isLoading}>Verify your phone number</Button>
          </ErrorMessage>
        </>
      ) : (
        <>
          <Input
            type="text" hook={otp}
            label="Verification code"
            hint="Enter the code that was just texted to your device"

            autoComplete="one-time-code"
            inputMode="numeric"
            readOnly={isLoading}
            placeholder="123456"
          />
          <ErrorMessage error={submitOtp.error} clear={submitOtp.reset}>
            <div className={styles.submitRow}>
              <Button onClick="reset" disabled={isLoading}>Edit your details</Button>
              <Button onClick="submit" disabled={isLoading}>Submit</Button>
            </div>
          </ErrorMessage>
        </>
      )}
    </form>
  );
};

export default CreateUser;