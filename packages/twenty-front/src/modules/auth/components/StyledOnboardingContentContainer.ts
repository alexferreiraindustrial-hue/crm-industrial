import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledOnboardingContentContainer = styled.div`
  margin-bottom: var(
    --auth-content-margin-bottom,
    ${themeCssVariables.spacing[8]}
  );
  margin-top: var(--auth-content-margin-top, ${themeCssVariables.spacing[4]});
  max-width: 100%;
  width: min(100%, ${ONBOARDING_CONTENT_BLOCK_WIDTH}px);
`;
