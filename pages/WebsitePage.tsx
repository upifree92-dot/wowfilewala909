import React from 'react';
import BackButton from '../components/BackButton';
import Editable from '../components/Editable';
import { useSEO } from '../hooks/useSEO';

const WebsitePage = () => {
  useSEO('Our Website', 'Information about our services and mission.');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-xl shadow-lg">
        <BackButton />
        <h1 className="text-4xl font-bold mb-8 border-b-2 border-cyan-500 pb-4 text-slate-800 dark:text-slate-200">
          <Editable contentKey="websitePage.title">
            Our Website
          </Editable>
        </h1>
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <Editable as="p" contentKey="websitePage.p1">
              Welcome to our official website page. Here you can find more information about our services, mission, and the team behind KGFILEWALA.
            </Editable>
            <Editable as="p" contentKey="websitePage.p2">
              We are dedicated to providing the best quality files and tools for all your mobile device needs. Our collection is constantly updated to ensure you have access to the latest resources.
            </Editable>
            <Editable as="h3" contentKey="websitePage.h3" className="font-bold text-xl pt-4">
              Our Services
            </Editable>
            <ul className="list-disc list-inside space-y-2">
                <li><Editable as="span" contentKey="websitePage.li1">Firmware and Flash Files</Editable></li>
                <li><Editable as="span" contentKey="websitePage.li2">Mobile Repairing Tools</Editable></li>
                <li><Editable as="span" contentKey="websitePage.li3">Box & Dongle Activations</Editable></li>
                <li><Editable as="span" contentKey="websitePage.li4">Schematic Diagrams</Editable></li>
            </ul>
             <Editable as="p" contentKey="websitePage.p3" className="pt-4">
              Thank you for choosing us. Explore the site to find what you need!
            </Editable>
        </div>
      </div>
    </div>
  );
};

export default WebsitePage;