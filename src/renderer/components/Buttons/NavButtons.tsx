interface INavButtonprops {
  active?: boolean;
  label: string;
  redirectPath?: string;
}

export default function NavButton({
  active,
  label,
  redirectPath,
}: INavButtonprops) {
  return (
    <div className="bg-transparent flex flex-col items-end py-2 pl-2">
      <div className="nav-btn-anch w-[30px] h-[30px]">
        <div />
      </div>
      <div className="bg-white rounded-l-full w-full p-5">{label}</div>
      <div className="nav-btn-anch-rev w-[30px] h-[30px]">
        <div />
      </div>
    </div>
  );
}
