import { FormProvider } from 'react-hook-form';

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/internal/SignInUpWithCredentials';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/internal/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft';
import { SignInUpWithSso } from '@/auth/sign-in-up/components/internal/SignInUpWithSso';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useWorkspaceBypass } from '@/auth/sign-in-up/hooks/useWorkspaceBypass';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';

export const SignInUpWorkspaceScopeForm = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);
  const workspaceAuthBypassProviders = useAtomStateValue(
    workspaceAuthBypassProvidersState,
  );
  const { shouldOfferBypass, shouldUseBypass } = useWorkspaceBypass();

  const { form } = useSignInUpForm();

  if (!workspaceAuthProviders) {
    return null;
  }

  const providers =
    shouldOfferBypass && shouldUseBypass
      ? {
          ...workspaceAuthBypassProviders,
          sso: [],
        }
      : workspaceAuthProviders;

  const showAlternateProviders = !providers.password;

  return (
    <StyledOnboardingContentContainer>
      {showAlternateProviders && providers.google && (
        <SignInUpWithGoogle action="join-workspace" />
      )}

      {showAlternateProviders && providers.microsoft && (
        <SignInUpWithMicrosoft action="join-workspace" />
      )}

      {showAlternateProviders && providers.sso.length > 0 && (
        <SignInUpWithSso />
      )}

      {providers.password && (
        // oxlint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...form}>
          <SignInUpWithCredentials />
        </FormProvider>
      )}
    </StyledOnboardingContentContainer>
  );
};
