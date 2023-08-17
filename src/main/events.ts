import requireAll from 'require-all';

const events = requireAll({
  dirname: `${__dirname}/events`,
  recursive: true,
});

export default function () {
  Object.values(events).forEach((event) => event());
}
