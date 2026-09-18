import React from 'react';
import { X, Award, Music, Compass, Sparkles } from 'lucide-react';
import { ArtistProfile } from '../types';

interface BioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ArtistProfile;
  onBookMe: () => void;
}

export const BioModal: React.FC<BioModalProps> = ({
  isOpen,
  onClose,
  profile,
  onBookMe,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#131417] border border-[#272932] rounded-xl p-6 sm:p-10 text-[#e1e3e6] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8b909f] hover:text-white p-1 rounded-md hover:bg-[#1f2128] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#c8a251] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Full Biography
            </span>
            <h2 className="text-3xl font-serif text-[#f3f4f7] mt-1.5 font-normal">
              {profile.name}
            </h2>
            <p className="text-sm italic text-[#c8a251] mt-1 font-serif">
              "{profile.quote}"
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-[#c8a251]/60 via-[#c8a251]/20 to-transparent"></div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#191a20] border border-[#262831]">
              <Award className="w-4 h-4 text-[#c8a251] mb-1" />
              <div className="font-semibold text-white">Grade 7 Pianist</div>
              <div className="text-[#888d9c]">13 Years Experience</div>
            </div>
            <div className="p-3 rounded-lg bg-[#191a20] border border-[#262831]">
              <Music className="w-4 h-4 text-[#c8a251] mb-1" />
              <div className="font-semibold text-white">KM Conservatory</div>
              <div className="text-[#888d9c]">A.R. Rahman Foundation</div>
            </div>
            <div className="p-3 rounded-lg bg-[#191a20] border border-[#262831]">
              <Compass className="w-4 h-4 text-[#c8a251] mb-1" />
              <div className="font-semibold text-white">Casio The Pianist</div>
              <div className="text-[#888d9c]">Seasons 1 & 2 Finalist</div>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-[#b5bac7]">
            {profile.fullBio ? (
              profile.fullBio.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-[#cfd3de] font-normal leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p>{profile.bioParagraph1}</p>
                <p>{profile.bioParagraph2}</p>
              </>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                onBookMe();
              }}
              className="flex-1 py-3 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold text-xs uppercase tracking-widest rounded-lg transition-colors text-center"
            >
              Book {profile.name}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-[#30333d] hover:border-[#606473] text-[#cfd3dd] text-xs uppercase tracking-widest rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
