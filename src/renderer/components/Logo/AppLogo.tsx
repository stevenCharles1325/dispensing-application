/* eslint-disable react/require-default-props */
import Logo from 'Assets/logo/Framelogo-gen.svg';

interface LogoProps {
  color?: 'normal' | 'dark' | 'light' | undefined;
  size?: number | undefined;
  withName?: boolean | undefined;
}

export default function AppLogo(props: LogoProps) {
  const { color = 'dark', size = 60, withName = false } = props;
  const logoColor = color === 'dark' ? { filter: 'invert(60%)' } : {};
  const textColor = color === 'dark' ? '#363030' : '#FFF';

  return (
    <div
      style={{ fontSize: size, color: '#676464' }}
      className="w-fit flex flex-row items-center"
    >
      <img src={Logo} alt="logo" width={size} style={{ ...logoColor }} />
      {withName ? (
        <p
          className="font-extrabold uppercase p-0 pt-1 m-0"
          style={{ fontFamily: 'Rubik ExtraBold', color: textColor }}
        >
          gen
        </p>
      ) : null}
    </div>
  );
}
