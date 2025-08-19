import { Navigation } from '@/components/navigation';
import { AIChat } from '@/components/ai-chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Calendar, PawPrint, Clock } from 'lucide-react';

export default function BookWithAssistantPage() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Natural Conversation',
      description: 'Chat naturally about your dog\'s needs and preferences',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI finds the best available times that work for you',
    },
    {
      icon: PawPrint,
      title: 'Pet-Focused',
      description: 'Personalized recommendations based on your dog\'s requirements',
    },
    {
      icon: Clock,
      title: 'Instant Booking',
      description: 'Book and confirm appointments in real-time',
    },
  ];

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Book with Melissa
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Let our smart booking assistant help you find the perfect care for your dog. 
              Just chat naturally about what you need!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <AIChat className="h-[700px]" />
            </div>

            {/* Features Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">How It Works</CardTitle>
                  <CardDescription>
                    Our AI assistant makes booking simple and personalized
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{feature.title}</h3>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Quick Start Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Try saying:</p>
                    <p className="text-blue-700">"I need boarding for my Golden Retriever next weekend"</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Or:</p>
                    <p className="text-green-700">"Can you show me available walk times this week?"</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900 mb-1">Or even:</p>
                    <p className="text-purple-700">"What services do you offer and what are the prices?"</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-gray-600">
                    The AI assistant can help with:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Checking availability</li>
                    <li>Comparing services</li>
                    <li>Understanding pricing</li>
                    <li>Booking appointments</li>
                    <li>Managing pet information</li>
                  </ul>
                  <div className="pt-2 mt-3 border-t">
                    <p className="text-xs text-gray-500">
                      You'll need to sign in to complete bookings and payments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
