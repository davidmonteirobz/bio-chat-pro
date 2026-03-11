import BioHeader from "@/components/BioHeader";
import ChatSection from "@/components/ChatSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-[100dvh] bg-background flex justify-center">
      <div className="w-full max-w-[390px] relative">
        <BioHeader />
        <ChatSection />
        <div className="px-4 pb-6">
          <WhatsAppButton />
        </div>
      </div>
    </div>
  );
};

export default Index;
