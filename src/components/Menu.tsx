interface MenuProps {
    selected?: string;
}

export const Menu = ({selected}: MenuProps) => {
  return (
    <menu role="tablist">
      <li role="tab" {...(selected == "home" ? { "aria-selected": true } : {})}>
        <a href="/">Home</a>
      </li>
      <li role="tab" {...(selected == "blog" ? { "aria-selected": true } : {})}>
        <a href="/blog">Blog</a>
      </li>
    </menu>
  );
};
