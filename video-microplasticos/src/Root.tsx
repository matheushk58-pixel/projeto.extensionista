import { Composition, Folder } from "remotion";
import { Apresentacao, CENAS, DURACAO_TOTAL } from "./Apresentacao";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Cenas">
        {CENAS.map(c => (
          <Composition key={c.id} id={c.id} component={c.componente} durationInFrames={c.duracao} fps={30} width={1920} height={1080} />
        ))}
      </Folder>
      <Composition id="Apresentacao" component={Apresentacao} durationInFrames={DURACAO_TOTAL} fps={30} width={1920} height={1080} />
    </>
  );
};
