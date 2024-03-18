import { Smile, Laugh, Meh, Frown, Angry } from "lucide-react";

export const SentimentIcon = ({ score }: { score: number }) => {
  const className = "h-4 w-4";
  if (score >= 85) {
    return <Smile className={className} />;
  } else if (score >= 60) {
    return <Laugh className={className} />;
  } else if (score >= 40) {
    return <Meh className={className} />;
  } else if (score >= 20) {
    return <Frown className={className} />;
  } else {
    return <Angry className={className} />;
  }
};
