const driveTabs = ['Images', 'Files'] as const;
type IDriveTabs = (typeof driveTabs)[number];

export type { IDriveTabs };
export default driveTabs;
