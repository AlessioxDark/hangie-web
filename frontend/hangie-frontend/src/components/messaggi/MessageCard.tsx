import DoubleTick from "@/assets/icons/DoubleTick";
import ProfileIcon from "@/components/ProfileIcon";

const MessageCard = ({ isUser, content, utenti, user_id, sent_at }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className=" flex flex-row items-start gap-1 2xl:gap-2 ">
      {!isUser && (
        <div className="w-10 h-10 2xl:w-14 2xl:h-14 -mt-4   ">
          <ProfileIcon user_id={user_id} />
        </div>
      )}

      <div
        className={`${
          isUser ? "bg-[#2563eb]" : "bg-bg-3"
        }  flex flex-row rounded-xl w-fit
		   justify-between max-w-xl
		   `}
      >
        <div
          className="flex flex-col px-4 py-1.5
		    pb-2.5"
        >
          {!isUser && (
            <span className={` ${"text-text-1"} font-body font-bold`}>
              {utenti.nome}
            </span>
          )}
          <span
            className={`font-body ${
              isUser ? "text-bg-1" : "text-text-1"
            } text-sm 2xl:text-base`}
          >
            {content}
          </span>
        </div>
        <div className="relative bottom-0.5 right-2 flex  items-end">
          <div className="flex flex-row items-center gap-1">
            <span
              className={` font-body font-[500] text-xs ${
                isUser ? "text-bg-1" : "text-text-1"
              }`}
            >
              {formatDate(sent_at)}
            </span>

            {isUser && <DoubleTick />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
