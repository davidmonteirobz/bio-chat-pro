import BioHeader from "@/components/BioHeader";
import ChatSection from "@/components/ChatSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="h-[100dvh] bg-background flex justify-center overflow-hidden">
      <div className="w-full max-w-[390px] flex flex-col h-full" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex-shrink-0">
          <BioHeader />
        </div>
        <div className="flex-1 min-h-0">
          <ChatSection />
        </div>
        <div className="flex-shrink-0 px-4 pb-3">
          <WhatsAppButton />
        </div>
      </div>
    </div>
  );
};

export default Index;
