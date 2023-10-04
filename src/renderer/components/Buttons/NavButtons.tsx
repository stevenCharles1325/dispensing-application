/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useNavigate } from 'react-router-dom';

/* eslint-disable react/require-default-props */
export interface INavButtonprops {
  id: number;
  icon?: any;
  active?: boolean;
  label: string;
  onClick?: () => void;
  redirectPath?: string;
}

export default function NavButton({
  id,
  icon,
  active,
  label,
  redirectPath,
  onClick,
}: INavButtonprops) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (redirectPath) {
      onClick?.();
      navigate(redirectPath);
    }
  };

  return (
    <div className="bg-transparent flex flex-col items-end py-2 pl-5">
      {active ? (
        <>
          <div className="nav-btn-anch w-[30px] h-[30px]">
            <div />
          </div>
          <div
            className="gap-3 bg-white rounded-l-full w-full p-5 flex flex-row cursor-pointer pl-[40px] shadow-md"
            onClick={handleClick}
          >
            <div>{icon}</div>
            <b className="leading-relaxed break-word">{label}</b>
          </div>
          <div className="nav-btn-anch-rev w-[30px] h-[30px]">
            <div />
          </div>
        </>
      ) : (
        <div
          className="gap-3 bg-transparent rounded-l-full w-full p-5 flex flex-row cursor-pointer pl-[40px]"
          onClick={handleClick}
        >
          <div>{icon}</div>
          <p className="leading-relaxed break-word">{label}</p>
        </div>
      )}
    </div>
  );
}
