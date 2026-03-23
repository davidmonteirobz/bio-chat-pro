import BioHeader from "@/components/BioHeader";
import ChatSection from "@/components/ChatSection";

const Index = () => {
  return (
    <div className="min-h-[100dvh] bg-background flex justify-center">
      <div className="w-full max-w-[390px] relative">
        <BioHeader />
        <ChatSection />
      </div>
    </div>
  );
};

export default Index;
