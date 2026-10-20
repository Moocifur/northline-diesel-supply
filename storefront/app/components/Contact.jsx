import { Phone, Clock, MapPin } from 'lucide-react'
import { SITE } from '@/lib/site'

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-xl text-gray-400">Contact details are made up, like the business</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Visit Us</h3>
            <div className="text-blue-400">
              {SITE.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Call or Email</h3>
            <div className="space-y-2">
              <a
                href={SITE.phoneHref}
                className="block text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {SITE.phone}
              </a>
              <p className="text-sm text-gray-400">{SITE.email}</p>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Business Hours</h3>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-300">Monday - Friday</span>
                <span className="text-blue-400 font-semibold">7AM - 5PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Saturday - Sunday</span>
                <span className="text-red-400 font-semibold">Closed</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact
