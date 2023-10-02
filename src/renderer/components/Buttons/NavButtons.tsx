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
    <div className="bg-transparent py-2 pl-2">
      <div>{label}</div>
    </div>
  );
}
