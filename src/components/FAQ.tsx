import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  return (
    <section id="faq" className="container py-16 sm:py-24">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12 font-darker text-white">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto max-w-4xl">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {[...Array(9)].map((_, i) => (
            <AccordionItem 
              key={`item-${i + 1}`}
              value={`item-${i + 1}`} 
              className="border border-black rounded-[24px] p-4 bg-white"
            >
              <AccordionTrigger className="text-xl md:text-2xl font-bold font-darker text-black hover:text-black/80 text-center px-4">
                <div className="flex-1 text-center">
                  {i === 0 && "What is Sparcel?"}
                  {i === 1 && "How does Sparcel work?"}
                  {i === 2 && "Who can use Sparcel?"}
                  {i === 3 && "What do spaza shop owners need to join?"}
                  {i === 4 && "How do shop owners get paid?"}
                  {i === 5 && "Is Sparcel safe?"}
                  {i === 6 && "What types of parcels can be returned?"}
                  {i === 7 && "How can my business partner with Sparcel?"}
                  {i === 8 && "Where is Sparcel currently operating?"}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-black text-lg font-darker mt-4 px-4">
                {i === 0 && "Sparcel is a parcel delivery platform that turns local spaza shops into trusted drop-off and collection points for parcels. We make it easy, fast, and cost-effective for people in townships and rural areas to send and receive parcels."}
                {i === 1 && (
                  <ul className="list-disc pl-6 space-y-2">
                    <li>A customer drops off their parcel at a registered spaza shop.</li>
                    <li>The shop logs the parcel using our simple mobile app.</li>
                    <li>The courier is notified and collects the parcel for delivery.</li>
                    <li>Everyone involved is notified throughout the process.</li>
                  </ul>
                )}
                {i === 2 && (
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Customers sending or receiving parcels in townships and rural areas.</li>
                    <li>Spaza shop owners looking to earn extra income.</li>
                    <li>E-commerce and logistics companies wanting to reduce delivery costs and improve accessibility in hard-to-reach areas.</li>
                  </ul>
                )}
                {i === 3 && "Just a smartphone, a secure space to store a few parcels, and a willingness to learn. We provide the app, training, and support to get started."}
                {i === 4 && "Spaza partners earn a fee per parcel — typically R10 to R20, depending on parcel size and volume. Payments are made directly to their preferred payout method."}
                {i === 5 && "Yes. We focus on compact, low-risk items like routers or small parcels. Shop owners receive guidance on handling and safety, and each parcel is verified and tracked in the system."}
                {i === 6 && "Currently, we focus on small to medium packages (under 10kg). We're expanding soon to include more product types and sizes."}
                {i === 7 && "Simple! Just Request a Demo or Contact Us and we'll show you how Sparcel can plug into your existing delivery flows to cut costs and improve reach."}
                {i === 8 && "We're rolling out in Gauteng and Cape Town townships first, with plans to expand nationwide as we onboard more shop partners and logistics providers."}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
