import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/SignInUpMode';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { captchaState } from '@/client-config/states/captchaState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const StyledForm = styled.form`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const StyledField = styled.input`
  appearance: none;
  background: rgba(8, 27, 52, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 10px;
  box-sizing: border-box;
  color: #f7f9fc;
  font-family: inherit;
  font-size: 14px;
  height: 40px;
  outline: none;
  padding: 0 14px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
  width: 100%;

  &::placeholder {
    color: rgba(247, 249, 252, 0.88);
  }

  &:hover {
    border-color: #ffffff;
  }

  &:focus {
    border-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(228, 179, 74, 0.28);
  }
`;

const StyledError = styled.div`
  color: #ffd2d2;
  font-size: 12px;
  line-height: 1.3;
  margin-top: 4px;
`;

const StyledForgotRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -6px;
`;

const StyledLinkButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  padding: 0;
  transition: color 160ms ease, transform 160ms ease;

  &:hover {
    color: #ffffff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledEntrarButton = styled.button`
  background: #0b2144;
  border: none;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(228, 179, 74, 0.18);
  color: #e4b34a;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  height: 42px;
  margin-top: 4px;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
  width: 100%;

  &:hover:not(:disabled) {
    background: #12315f;
    box-shadow: 0 10px 24px rgba(11, 33, 68, 0.45);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }
`;

const StyledCreateAccountRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: -4px;
`;

export const SignInUpWithCredentials = () => {
  const { t } = useLingui();
  const form = useFormContext<Form>();
  const store = useStore();
  const [showErrors, setShowErrors] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const pendingSignInRef = useRef(false);
  const captcha = useAtomStateValue(captchaState);
  const captchaToken = useAtomStateValue(captchaTokenState);
  const isRequestingCaptchaToken = useAtomStateValue(
    isRequestingCaptchaTokenState,
  );
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const { handleResetPassword } = useHandleResetPassword();
  const {
    signInUpStep,
    signInUpMode,
    continueWithCredentials,
    submitCredentials,
  } = useSignInUp(form);

  const isBusy = isCheckingUser || form.formState.isSubmitting;

  useEffect(() => {
    if (!pendingSignInRef.current) {
      return;
    }

    if (signInUpStep !== SignInUpStep.Password) {
      return;
    }

    const captchaMustSettle =
      isDefined(captcha?.provider) &&
      (isRequestingCaptchaToken || !isDefined(captchaToken));

    if (captchaMustSettle) {
      return;
    }

    if (isDDLLocked && signInUpMode === SignInUpMode.SignUp) {
      pendingSignInRef.current = false;
      return;
    }

    pendingSignInRef.current = false;
    void form.handleSubmit(submitCredentials)();
  }, [
    captcha?.provider,
    captchaToken,
    form,
    isDDLLocked,
    isRequestingCaptchaToken,
    signInUpMode,
    signInUpStep,
    submitCredentials,
  ]);

  const submit = async () => {
    if (isBusy) {
      return;
    }

    setShowErrors(true);
    form.clearErrors();

    const email = form.getValues('email')?.trim() ?? '';
    const password = form.getValues('password') ?? '';
    let hasValidationError = false;

    if (!EMAIL_PATTERN.test(email)) {
      form.setError('email', {
        type: 'manual',
        message: t`Email must be a valid email`,
      });
      hasValidationError = true;
    }

    if (!PASSWORD_REGEX.test(password)) {
      form.setError('password', {
        type: 'manual',
        message: t`Password must be between 8 and 50 characters`,
      });
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    if (signInUpStep === SignInUpStep.Password) {
      await form.handleSubmit(submitCredentials)();
      return;
    }

    pendingSignInRef.current = true;
    setIsCheckingUser(true);

    try {
      await continueWithCredentials();
      const step = store.get(signInUpStepState.atom);

      if (step !== SignInUpStep.Password) {
        pendingSignInRef.current = false;
      }
    } finally {
      setIsCheckingUser(false);
    }
  };

  return (
    <StyledForm
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Controller
        name="email"
        control={form.control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <div>
            <StyledField
              autoComplete="email"
              autoFocus
              name="email"
              type="text"
              inputMode="email"
              value={value}
              placeholder={t`Usuário`}
              aria-label={t`Usuário`}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.value)}
            />
            {showErrors && isDefined(error?.message) && (
              <StyledError>{error.message}</StyledError>
            )}
          </div>
        )}
      />
      <Controller
        name="password"
        control={form.control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <div>
            <StyledField
              autoComplete="current-password"
              name="password"
              type="password"
              value={value ?? ''}
              placeholder={t`Senha`}
              aria-label={t`Senha`}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.value)}
            />
            {showErrors && isDefined(error?.message) && (
              <StyledError>{error.message}</StyledError>
            )}
          </div>
        )}
      />
      <StyledForgotRow>
        <StyledLinkButton
          type="button"
          onClick={handleResetPassword(form.getValues('email'))}
        >
          <Trans>Esqueci a Senha</Trans>
        </StyledLinkButton>
      </StyledForgotRow>
      <StyledEntrarButton type="submit" disabled={isBusy}>
        <Trans>Entrar</Trans>
      </StyledEntrarButton>
      <StyledCreateAccountRow>
        <StyledLinkButton type="button" onClick={() => void submit()}>
          <Trans>Criar Conta</Trans>
        </StyledLinkButton>
      </StyledCreateAccountRow>
    </StyledForm>
  );
};
