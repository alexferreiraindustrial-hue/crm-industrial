import { Title } from '@/auth/components/Title';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { WorkspaceSelectionFooter } from '@/auth/sign-in-up/components/WorkspaceSelectionFooter';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { styled } from '@linaria/react';
import { type JSX } from 'react';

const StyledTitleContainer = styled.div`
  color: #f4f7fb;
  margin-bottom: 16px;
  text-align: center;
  width: 100%;

  & * {
    color: #f4f7fb;
  }
`;

const StyledFormContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type SignInUpStandardContentProps = {
  signInUpForm: JSX.Element | null;
  signInUpStep: SignInUpStep;
  title: string;
  showTitle: boolean;
};

export const SignInUpStandardContent = ({
  signInUpForm,
  signInUpStep,
  title,
  showTitle,
}: SignInUpStandardContentProps) => {
  return (
    <>
      {showTitle && (
        <StyledTitleContainer>
          <Title animate>{title}</Title>
        </StyledTitleContainer>
      )}
      <StyledFormContainer>{signInUpForm}</StyledFormContainer>
      {signInUpStep === SignInUpStep.WorkspaceSelection && (
        <WorkspaceSelectionFooter />
      )}
      {![
        SignInUpStep.Init,
        SignInUpStep.Email,
        SignInUpStep.Password,
        SignInUpStep.TwoFactorAuthenticationProvision,
        SignInUpStep.TwoFactorAuthenticationVerification,
        SignInUpStep.TwoFactorAuthenticationRecovery,
        SignInUpStep.WorkspaceSelection,
        SignInUpStep.WorkspaceCreation,
      ].includes(signInUpStep) && <FooterNote />}
    </>
  );
};
