import BioHeader from "@/components/BioHeader";
import ChatSection from "@/components/ChatSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[390px] relative">
        <BioHeader />
        <ChatSection />
        <WhatsAppButton />
      </div>
    </div>
  );
};

export default Index;
