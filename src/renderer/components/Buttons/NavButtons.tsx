/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { PermissionsKebabType } from 'Main/data/defaults/permissions';
import usePermission from 'UI/hooks/usePermission';
import { useNavigate } from 'react-router-dom';

/* eslint-disable react/require-default-props */
export interface INavButtonprops {
  id: number;
  icon?: any;
  active?: boolean;
  label: string;
  onClick?: () => void;
  redirectPath?: string;
  disabled?: boolean;
  permissions?: PermissionsKebabType[];
  parentCollapsed?: boolean;
}

export default function NavButton({
  id,
  icon,
  active,
  label,
  permissions,
  redirectPath,
  onClick,
  disabled = false,
  parentCollapsed = false,
}: INavButtonprops) {
  const hasPermission = usePermission();
  const navigate = useNavigate();
  const color = active ? 'var(--text-color)' : 'white';
  const fontWeight = active ? 'font-extrabold' : 'font-thin';

  const handleClick = () => {
    if (redirectPath) {
      onClick?.();
      return navigate(redirectPath);
    }
  };

  if (permissions && !hasPermission(...permissions)) {
    return null;
  }

  return (
    <div
      className={`bg-transparent flex flex-col items-end py-2 pl-5 ${fontWeight}`}
      style={{ color }}
      aria-disabled={disabled}
    >
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
            {
              parentCollapsed
              ? null
              : <b className="leading-relaxed break-word">{label}</b>
            }
          </div>
          <div className="nav-btn-anch-rev w-[30px] h-[30px]">
            <div />
          </div>
        </>
      ) : (
        <div
          className={`gap-3 bg-transparent rounded-l-full w-full p-5 flex flex-row cursor-pointer pl-[40px] hover:bg-black/20 ${
            disabled ? 'disabled:opacity-75' : ''
          }`}
          onClick={!disabled ? handleClick : undefined}
        >
          <div>{icon}</div>
          {
            parentCollapsed
            ? null
            : <p className="leading-relaxed break-word">{label}</p>
          }
        </div>
      )}
    </div>
  );
}
