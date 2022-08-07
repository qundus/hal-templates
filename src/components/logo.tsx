type Props = {
  link: string;
  src: string;
  alt?: string;
};
export function Logo(props: Props) {
  return (
    <a href={props.link} class="flex$ fit$ fight$" target="_blank">
      <img
        src={props.src}
        class="logo$"
        // class="h-10rem p-1.5em"
        alt={
          props.alt
            ? props.alt
            : props.src.substring(props.src.lastIndexOf("/"), props.src.length)
        }
      />
    </a>
  );
}
