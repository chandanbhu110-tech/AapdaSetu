/**
 * SIH NER Smart Logistics Platform - Alert Multilingual Dictionary & Formatter
 * 
 * Supports:
 * - English ('en', Default)
 * - Hindi ('hi')
 * - Assamese ('as')
 * 
 * Rules:
 * - Static structured translations (100% offline capable, no external API calls).
 * - Dynamic placeholder interpolation ({route}, {vehicle}, {location}, {cargo}, etc.).
 * - Safe fallback: If a translation key or language is missing, gracefully falls back to English.
 * - Does not alter alert IDs, counts, timestamps, or severity.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া' }
];

export const SEVERITY_TRANSLATIONS = {
  Critical: {
    en: 'Critical',
    hi: 'गंभीर (Critical)',
    as: 'সংকটজনক (Critical)'
  },
  High: {
    en: 'High',
    hi: 'उच्च (High)',
    as: 'উচ্চ (High)'
  },
  Warning: {
    en: 'Warning',
    hi: 'चेतावनी (Warning)',
    as: 'সতৰ্কবাৰ্তা (Warning)'
  },
  Moderate: {
    en: 'Moderate',
    hi: 'मध्यम (Moderate)',
    as: 'মজলীয়া (Moderate)'
  },
  Resolved: {
    en: 'Resolved',
    hi: 'समाधान (Resolved)',
    as: 'সমাধান (Resolved)'
  }
};

export const HAZARD_TYPE_TRANSLATIONS = {
  'Landslide': {
    en: 'Landslide',
    hi: 'भूस्खलन',
    as: 'ভূমিস্খলন'
  },
  'Bridge Damage': {
    en: 'Bridge Damage',
    hi: 'पुल क्षति',
    as: 'দলং ক্ষতি'
  },
  'Road Collapse': {
    en: 'Road Collapse',
    hi: 'सड़क धंसना',
    as: 'পথ খহি পৰা'
  },
  'Flood / Waterlogging': {
    en: 'Flood / Waterlogging',
    hi: 'बाढ़ / जलभराव',
    as: 'বানপানী / জলমগ্নতা'
  },
  'Severe Weather': {
    en: 'Severe Weather',
    hi: 'भीषण मौसम',
    as: 'প্ৰতিকূল বতৰ'
  },
  'Traffic Congestion': {
    en: 'Traffic Congestion',
    hi: 'यातायात जाम',
    as: 'যান-জঁট'
  }
};

// Keyed by template identifiers or recognizable patterns in title / alert_id
export const ALERT_TEMPLATES = {
  // 1. Critical Medicine Delivery at Risk
  'CRIT_MED': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('MED')) ||
      (alert.title && alert.title.toLowerCase().includes('medicine')),
    translations: {
      en: {
        title: 'Critical Medicine Delivery at Risk',
        description: 'Vehicle {vehicle} transporting emergency medical cargo on Guwahati → Imphal is at risk due to Critical Route Risk and active Jiribam bridge impairment.',
        action_required: 'Recommend immediate rerouting via Lumding-Silchar bypass corridor.'
      },
      hi: {
        title: 'गंभीर चिकित्सा आपूर्ति जोखिम में',
        description: 'गुवाहाटी → इम्फाल मार्ग पर आपातकालीन चिकित्सा सामग्री ले जा रहा वाहन {vehicle} गंभीर मार्ग जोखिम और जिरीबाम पुल क्षति के कारण जोखिम में है।',
        action_required: 'लुमडिंग-सिलचर बाईपास कॉरिडोर के माध्यम से तत्काल पुनः मार्ग निर्धारण (रीरूट) की सिफारिश की जाती है।'
      },
      as: {
        title: 'সংকটজনক চিকিৎসা সামগ্ৰী পৰিবহণ ঝুঁকিপূৰ্ণ',
        description: 'গুৱাহাটী → ইম্ফল কৰিড’ৰত জৰুৰীকালীন চিকিৎসা সামগ্ৰী কঢ়িওৱা বাহন {vehicle} সংকটজনক পথ সংকট আৰু জিৰিবাম দলং ক্ষতিৰ বাবে বিপদত পৰিছে।',
        action_required: 'লামডিং-শিলচৰ বাইপাছ কৰিড’ৰেৰে তাৎক্ষণিক বিকল্প পথ ব্যৱহাৰৰ পৰামৰ্শ দিয়া হৈছে।'
      }
    }
  },

  // 2. Critical Route Disruption Risk / Route Health
  'ROUTE_DISRUPT': {
    matcher: (alert) => 
      (alert.alert_id && (alert.alert_id.includes('DISRUPT') || alert.alert_id.includes('HEALTH'))) ||
      (alert.title && (alert.title.toLowerCase().includes('route disruption') || alert.title.toLowerCase().includes('route health'))),
    translations: {
      en: {
        title: 'Critical Route Disruption Risk',
        description: 'Guwahati – Imphal corridor Health Score dropped to 25/100 with Random Forest AI disruption risk elevated above safe threshold.',
        action_required: 'Deploy emergency BRO structural review team to Jiribam sector.'
      },
      hi: {
        title: 'गंभीर मार्ग अवरोध जोखिम',
        description: 'गुवाहाटी – इम्फाल कॉरिडोर का स्वास्थ्य स्कोर गिरकर 25/100 हो गया है तथा एआई व्यवधान जोखिम सुरक्षित सीमा से अधिक है।',
        action_required: 'जिरीबाम क्षेत्र में आपातकालीन बीआरओ संरचनात्मक समीक्षा दल तैनात करें।'
      },
      as: {
        title: 'সংকটজনক পথ বিঘিনিৰ আশংকা',
        description: 'গুৱাহাটী – ইম্ফল কৰিড’ৰৰ স্বাস্থ্য স্ক’ৰ ২৫/১০০ লৈ হ্ৰাস পাইছে আৰু এআই বিঘিনিৰ আশংকা সুৰক্ষিত সীমাৰ ওপৰত।',
        action_required: 'জিৰিবাম খণ্ডত জৰুৰীকালীন বিআৰঅ’ দল মোতায়েন কৰক।'
      }
    }
  },

  // 3. Severe Weather Risk
  'WEATHER_RISK': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('WEATHER')) ||
      (alert.title && alert.title.toLowerCase().includes('weather')),
    translations: {
      en: {
        title: 'Severe Weather Risk',
        description: 'Intense precipitation detected along Shillong → Silchar corridor triggering landslide vulnerability alert at Sonapur.',
        action_required: 'Hold heavy multi-axle freight at Lad Rymbai staging depot.'
      },
      hi: {
        title: 'भीषण मौसम जोखिम',
        description: 'शिलांग → सिलचर कॉरिडोर पर भारी वर्षा दर्ज की गई, जिससे सोनापुर में भूस्खलन की चेतावनी सक्रिय हुई।',
        action_required: 'लड रिम्बाई स्टेजिंग डिपो पर भारी मल्टी-एक्सल मालवाहक वाहनों को रोकें।'
      },
      as: {
        title: 'প্ৰতিকূল বতৰৰ সতৰ্কবাৰ্তা',
        description: 'শ্বিলং → শিলচৰ কৰিড’ৰত প্ৰবল বৃষ্টিপাত হৈছে, যাৰ বাবে সোণাপুৰত ভূমিস্খলনৰ সতৰ্কতা জাৰি কৰা হৈছে।',
        action_required: 'লাদ ৰিম্বাই ডিপোত গধুৰ মালবাহী বাহনসমূহ স্থগিত ৰাখক।'
      }
    }
  },

  // 4. Slope Saturation & Landslide Hazard
  'SLOPE_LANDSLIDE': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('SLOPE')) ||
      (alert.title && (alert.title.toLowerCase().includes('slope') || alert.title.toLowerCase().includes('landslide'))),
    translations: {
      en: {
        title: 'Slope Saturation & Landslide Hazard',
        description: 'Slope moisture saturation reached 82% threshold after 48h persistent monsoonal downpour.',
        action_required: 'Deploy NHAI earth-moving equipment; halt heavy fuel tankers at Nongpoh checkgate.'
      },
      hi: {
        title: 'ढलान जल-संतृप्ति एवं भूस्खलन खतरा',
        description: '48 घंटे की लगातार मानसूनी बारिश के बाद ढलान नमी संतृप्ति 82% सीमा तक पहुंच गई है।',
        action_required: 'एनएचएआई अर्थ-मूविंग उपकरण तैनात करें; नोंगपोह चेकगेट पर भारी ईंधन टैंकरों को रोकें।'
      },
      as: {
        title: 'পাহাৰীয়া মাটিৰ আৰ্দ্ৰতা আৰু ভূমিস্খলনৰ বিপদ',
        description: '৪৮ ঘণ্টা ধাৰাসাৰ বৰষুণৰ ফলত পাহাৰীয়া মাটিৰ আৰ্দ্ৰতা ৮২% স্তৰ স্পৰ্শ কৰিছে।',
        action_required: 'এনএইচএআইৰ মাটি খন্দা মেচিন মোতায়েন কৰক; নংপোহ চেকগেটত গধুৰ ইন্ধন টেংকাৰ ৰখাই ৰাখক।'
      }
    }
  },

  // 5. Vehicle Delivery Delayed
  'VEHICLE_DELAY': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('DELAY')) ||
      (alert.title && alert.title.toLowerCase().includes('delayed')),
    translations: {
      en: {
        title: 'Vehicle Delivery Delayed',
        description: 'Vehicle {vehicle} ({cargo}) delayed by 2.4 hours due to queue near Sonapur landslide clearance.',
        action_required: 'Monitor clearance progress and supply food-ration ETA to Silchar hub.'
      },
      hi: {
        title: 'वाहन वितरण में विलंब',
        description: 'सोनापुर भूस्खलन निकासी के पास कतार के कारण वाहन {vehicle} ({cargo}) 2.4 घंटे विलंबित है।',
        action_required: 'निकासी प्रगति की निगरानी करें और सिलचर हब को राशन ईटीए प्रदान करें।'
      },
      as: {
        title: 'যান-বাহন পৰিবহণত বিলম্ব',
        description: 'সোণাপুৰ ভূমিস্খলন পথ নিষ্কাশনৰ বাবে বাহন {vehicle} ({cargo}) ২.৪ ঘণ্টা পলম হৈছে।',
        action_required: 'পথ মুকলিৰ অগ্ৰগতি নিৰীক্ষণ কৰক আৰু শিলচৰ কেন্দ্ৰলৈ নতুন ইটিএ প্ৰেৰণ কৰক।'
      }
    }
  },

  // 6. Freight Congestion Bottleneck
  'TRAFFIC_CONGESTION': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('TRAFFIC')) ||
      (alert.title && (alert.title.toLowerCase().includes('congestion') || alert.title.toLowerCase().includes('traffic'))),
    translations: {
      en: {
        title: 'Freight Congestion Bottleneck',
        description: 'Heavy freight bottleneck at Jalukbari interchange due to emergency highway surface maintenance.',
        action_required: 'Divert outgoing non-emergency convoys via North Guwahati bypass.'
      },
      hi: {
        title: 'माल ढुलाई जाम एवं संकुलन',
        description: 'आपातकालीन राजमार्ग सतह मरम्मत के कारण जालुकबारी इंटरचेंज पर भारी माल ढुलाई जाम।',
        action_required: 'गैर-आपातकालीन काफिलों को उत्तर गुवाहाटी बाईपास से डायवर्ट करें।'
      },
      as: {
        title: 'মালবাহী যান-জঁটৰ সমস্যা',
        description: 'জৰুৰীকালীন ৰাজপথ মেৰামতিৰ বাবে জালুকবাৰী সংযোগী পথত প্ৰবল যান-জঁট।',
        action_required: 'অনা-জৰুৰীকালীন বাহনসমূহ উত্তৰ গুৱাহাটী বাইপাছেৰে ঘূৰাই পঠিয়াওক।'
      }
    }
  },

  // 7. Corridor Clearance Completed
  'ROUTE_CLEARANCE': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('CLEAR')) ||
      (alert.title && alert.title.toLowerCase().includes('clearance')),
    translations: {
      en: {
        title: 'Corridor Clearance Completed',
        description: 'Fallen trees and rock fragments cleared by Highway Patrol. Pavement inspected and verified safe.',
        action_required: 'All commercial freight lanes reopened. Normal transit protocol restored.'
      },
      hi: {
        title: 'कॉरिडोर निकासी कार्य पूर्ण',
        description: 'राजमार्ग गश्ती दल द्वारा गिरे हुए पेड़ों और चट्टानों के मलबे को साफ कर दिया गया है। सड़क का निरीक्षण कर सुरक्षित पाया गया।',
        action_required: 'सभी वाणिज्यिक माल लेन फिर से खोली गईं। सामान्य पारगमन प्रोटोकॉल बहाल।'
      },
      as: {
        title: 'কৰিড’ৰ মুকলি প্ৰক্ৰিয়া সম্পূৰ্ণ',
        description: 'ৰাজপথ পেট্ৰ’ল দলে খহি পৰা গছ আৰু শিলৰ টুকুৰা আঁতৰাই পেলাইছে। পথ পৰীক্ষা কৰি সুৰক্ষিত ঘোষণা কৰা হৈছে।',
        action_required: 'সকলো বাণিজ্যিক লেন পুনৰ মুকলি কৰা হ’ল। স্বাভাৱিক যাতায়াত ব্যৱস্থা বাহাল।'
      }
    }
  },

  // 8. Ground Hazard / Field Incident Alert (Phase 2 dynamic alerts)
  'GROUND_HAZARD': {
    matcher: (alert) => 
      (alert.alert_id && alert.alert_id.includes('HAZARD')) ||
      (alert.title && (alert.title.toLowerCase().includes('hazard') || alert.title.toLowerCase().includes('obstruction'))),
    translations: {
      en: {
        title: '{severity} Hazard: {type}',
        description: 'Ground hazard reported on {route} ({location}): {description}',
        action_required: 'Immediate corridor risk evaluation and alternate routing recommended.'
      },
      hi: {
        title: '{severity} खतरा: {type}',
        description: '{route} ({location}) पर जमीनी खतरे की सूचना: {description}',
        action_required: 'तत्काल कॉरिडोर जोखिम मूल्यांकन और वैकल्पिक मार्ग की सिफारिश की जाती है।'
      },
      as: {
        title: '{severity} বিপদ: {type}',
        description: '{route} ({location})ত জৰুৰীকালীন বিপদৰ প্ৰতিবেদন: {description}',
        action_required: 'তাৎক্ষণিক কৰিড’ৰ ঝুঁকি মূল্যাংকন আৰু বিকল্প পথ নিৰ্ধাৰণৰ পৰামৰ্শ দিয়া হৈছে।'
      }
    }
  }
};

/**
 * Interpolates placeholders like {vehicle}, {route}, {location}, {cargo}
 */
function interpolate(templateStr, params = {}) {
  if (!templateStr || typeof templateStr !== 'string') return '';
  return templateStr.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined && params[key] !== null ? params[key] : match;
  });
}

/**
 * Returns a localized representation of an alert.
 * 
 * Guarantees:
 * - Does not mutate the original alert object.
 * - ID, timestamp, route_id, vehicle_id, and severity value remain intact.
 * - Missing translations safely fall back to the alert's original English values.
 * 
 * @param {Object} alert The alert object
 * @param {string} lang Language code ('en', 'hi', 'as')
 * @returns {Object} A new alert object with localized title, description, and action_required
 */
export function getLocalizedAlert(alert, lang = 'en') {
  if (!alert) return alert;
  if (!lang || lang === 'en') {
    return alert; // Return as-is for default English
  }

  // Find matching template
  let matchedTemplate = null;
  for (const key of Object.keys(ALERT_TEMPLATES)) {
    const t = ALERT_TEMPLATES[key];
    if (t.matcher && t.matcher(alert)) {
      matchedTemplate = t;
      break;
    }
  }

  if (!matchedTemplate || !matchedTemplate.translations) {
    return alert; // Safe fallback to original English
  }

  const langPack = matchedTemplate.translations[lang] || matchedTemplate.translations['en'];
  if (!langPack) {
    return alert;
  }

  // Prepare replacement parameters
  const params = {
    vehicle: alert.vehicle_id && alert.vehicle_id !== '—' ? alert.vehicle_id : 'V001',
    route: alert.route_id || alert.location || 'NER Corridor',
    location: alert.location || alert.route_id || 'Regional Sector',
    cargo: 'Emergency Cargo',
    severity: SEVERITY_TRANSLATIONS[alert.severity]?.[lang] || alert.severity || 'Critical',
    type: alert.type || alert.title || 'Hazard',
    description: alert.description || ''
  };

  const localizedTitle = interpolate(langPack.title, params) || alert.title;
  const localizedDescription = interpolate(langPack.description, params) || alert.description;
  const localizedAction = interpolate(langPack.action_required, params) || alert.action_required;

  return {
    ...alert,
    title: localizedTitle,
    description: localizedDescription,
    action_required: localizedAction
  };
}
