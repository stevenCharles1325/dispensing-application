const driveTabs = ['Images'] as const;
type IDriveTabs = (typeof driveTabs)[number];

export type { IDriveTabs };
export default driveTabs;
