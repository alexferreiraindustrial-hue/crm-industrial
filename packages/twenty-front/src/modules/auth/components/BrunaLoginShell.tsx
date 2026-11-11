import { BrunaLoginScene } from '@/auth/components/BrunaLoginScene';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

const StyledBackdrop = styled.div`
  align-items: center;
  background: #071428;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100dvh / var(--t-zoom, 1));
  overflow-x: hidden;
  overflow-y: auto;
  padding: 36px 16px;
  position: relative;
  width: 100%;
`;

const StyledStage = styled.div`
  align-items: center;
  animation: bruna-rise 720ms cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;

  @keyframes bruna-rise {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const StyledLogoButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-bottom: 28px;
  padding: 0;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledLogo = styled.img`
  display: block;
  height: auto;
  width: min(210px, 68vw);
`;

const StyledCard = styled.div`
  --auth-content-margin-bottom: 0px;
  --auth-content-margin-top: 0px;

  backdrop-filter: blur(18px);
  background: rgba(186, 208, 228, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 18px;
  box-shadow:
    0 20px 50px rgba(2, 10, 28, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  box-sizing: border-box;
  padding: 26px 22px 16px;
  width: min(312px, calc(100vw - 40px));
`;

type BrunaLoginShellProps = {
  children: ReactNode;
  onLogoClick?: () => void;
};

export const BrunaLoginShell = ({
  children,
  onLogoClick,
}: BrunaLoginShellProps) => {
  return (
    <StyledBackdrop>
      <BrunaLoginScene />
      <StyledStage>
        <StyledLogoButton type="button" onClick={onLogoClick}>
          <StyledLogo src="/images/bruna/logo.png" alt="Bruna Logística" />
        </StyledLogoButton>
        <StyledCard>{children}</StyledCard>
      </StyledStage>
    </StyledBackdrop>
  );
};
