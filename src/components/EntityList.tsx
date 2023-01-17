import { Entity } from "../stores/EntityStoreSignals";
import { Avatar } from "./Avatar";

type EntityListProps = {
  entities: Entity[];
};

export const EntityList = ({ entities }: EntityListProps) => {
  return (
    <div className="flex-1">
      {entities.map((entity, index) => (
        <div
          className={`flex items-center justify-between border border-gray-500 rounded font-bold py-2 px-8 ${
            index === entities.length - 1 ? "" : "mb-3"
          }`}
        >
          <div className="flex items-center">
            <Avatar alt={entity.displayName} />
            <span className="px-4 text-xl">{entity.displayName}</span>
          </div>
          <button className="border border-white p-1 rounded focus:outline-none">
            Add <i className="fa-solid fa-user-plus"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
