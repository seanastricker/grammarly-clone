/**
 * @fileoverview Home page component for guest users
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Home page that welcomes users and describes the D&D toolkit features.
 * Users are automatically signed in as guests and can explore before registering.
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  ScrollText, 
  Sparkles, 
  Users, 
  Shield, 
  Zap, 
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Home page component
 * 
 * Landing page that describes the app's purpose and features.
 * Automatically signs users in as guests so they can explore immediately.
 * 
 * @component
 */
export const HomePage: React.FC = () => {
  const { user, continueAsGuest, isLoading } = useAuth();
  const navigate = useNavigate();

  // Auto-sign in as guest if not already authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      continueAsGuest().catch(console.error);
    }
  }, [isLoading, user, continueAsGuest]);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered D&D Campaign Assistant</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Craft Epic
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {" "}D&D Adventures
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Dungeons & Drafting is your AI-powered companion for creating immersive D&D campaigns. 
              Generate compelling storylines, craft memorable NPCs, balance encounters, and bring your 
              fantasy worlds to life with advanced writing assistance.
            </p>

            {/* Hero CTAs */}
            <div className="flex justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg h-auto"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Creating Campaigns
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex items-center justify-center space-x-8 text-slate-500">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-sm">AI-Powered Writing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm">Privacy First</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm">DM Community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Everything You Need to Master D&D Campaigns
            </h2>
            <p className="text-xl text-slate-600">
              From grammar-perfect narratives to balanced encounters, our AI toolkit 
              helps you create professional-quality content for your tabletop adventures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <ScrollText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Campaign Generation</h3>
              <p className="text-slate-600 mb-4">
                Generate complete campaign outlines, plot hooks, and story arcs with AI assistance. 
                Create compelling narratives that keep your players engaged session after session.
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Story Generator Active
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Character Creation</h3>
              <p className="text-slate-600 mb-4">
                Generate rich character backgrounds. Bring depth and personality to every inhabitant of your world.
              </p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Name Generator Active
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Balance Analysis</h3>
              <p className="text-slate-600 mb-4">
                Analyze encounter difficulty, party balance, and campaign pacing. Ensure your 
                adventures are challenging but fair with AI-powered balance recommendations.
              </p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Balance Checker Active
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Monster Re-skinning</h3>
              <p className="text-slate-600 mb-4">
                Transform existing monsters into unique creatures that fit your world. 
                Get creative variations while maintaining balanced statistics.
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Monster Tools Active
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Writing Assistant</h3>
              <p className="text-slate-600 mb-4">
                Perfect your campaign notes with advanced grammar checking, style suggestions, 
                and writing improvements. Professional-quality content every time.
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Grammar AI Active
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-6">
                <UserPlus className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Fantasy Name Generator</h3>
              <p className="text-slate-600 mb-4">
                Generate authentic fantasy names for characters. 
                Create memorable identities that enhance your world's immersion and storytelling.
              </p>
              <div className="flex items-center text-pink-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Name Generator Active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Become a Master Storyteller?
            </h2>
            <p className="text-xl text-indigo-100 mb-12">
              Join thousands of Dungeon Masters who trust Dungeons & Drafting to elevate their campaigns. 
              Start creating epic adventures today—no experience required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 text-lg h-auto font-semibold"
              >
                <ScrollText className="w-5 h-5 mr-2" />
                Start Your First Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-indigo-200 text-sm mt-6">
              🎲 Currently exploring as a guest • Sign in to save your campaigns
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 