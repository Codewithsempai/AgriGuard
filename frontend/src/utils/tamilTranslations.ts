/**
 * Tamil translation dictionaries and helpers for disease pathology,
 * symptoms, cultural, biological, and chemical treatments.
 */

export const TREATMENT_TRANSLATIONS: Record<string, string> = {
  // General & Healthy Crop Recommendations
  "Maintain clean cultivation and remove symptomatic foliage.":
    "பாதிக்கப்பட்ட இலைகளை உடனே அகற்றி வயலை எப்போதும் சுத்தமாக பராமரிக்கவும்.",
  "Apply beneficial biocontrol agents like Pseudomonas fluorescens.":
    "சூடோமோனாஸ் புளோரசன்ஸ் அல்லது டிரைக்கோடெர்மா போன்ற நன்மை செய்யும் உயிரியல் கட்டுப்பாட்டு காரணிகளைப் பயன்படுத்தவும்.",
  "Consult local agricultural officer before applying chemical sprays.":
    "தேவைப்பட்டால் உள்ளூர் வேளாண்மை விரிவாக்க அலுவலரின் வழிகாட்டுதலுடன் தகுந்த இரசாயன மருந்துகளை தெளிக்கவும்.",
  "Practice good crop hygiene, balanced nutrition, and certified seeds.":
    "சான்றளிக்கப்பட்ட தரமான விதைகளைப் பயன்படுத்தவும், தகுந்த சமச்சீர் உரமிடுதல் மற்றும் பயிர் சுகாதாரத்தை கடைபிடிக்கவும்.",
  "Foliar abnormalities detected matching the classification pattern.":
    "பயிர் இலைகளில் மாதிரிக்குரிய அறிகுறிகள் தென்படுகின்றன. கவனமாக கண்காணிக்கவும்.",

  // Tomato Early Blight
  "Remove and burn infected lower leaves promptly.":
    "பாதிக்கப்பட்ட அடி இலைகளை உடனே பறித்து வயலுக்கு வெளியே எரித்து அழிக்கவும்.",
  "Ensure drip irrigation to keep foliage dry.":
    "இலைகளில் ஈரம் தங்காமல் இருக்க சொட்டு நீர் பாசன முறையைப் பின்பற்றவும்.",
  "Practice 3-year crop rotation avoiding Solanaceae family.":
    "தக்காளி, கத்தரி குடும்ப பயிர்களை தவிர்த்து 3 ஆண்டுகள் சுழற்சி முறையில் மாற்று பயிர் சாகுபடி செய்யவும்.",
  "Apply Trichoderma viride or Pseudomonas fluorescens as foliar spray (5g/L).":
    "டிரைக்கோடெர்மா விரிடி அல்லது சூடோமோனாஸ் (1 லிட்டருக்கு 5 கிராம்) இலைகளில் தெளிக்கவும்.",
  "Neem oil spray (3-5 ml/L) during early emergence.":
    "தொடக்க நிலையில் வேப்பெண்ணெய் கரைசல் (1 லிட்டருக்கு 3-5 மி.லி) தெளிக்கவும்.",
  "Spray Mancozeb (2 g/L) or Chlorothalonil (2 g/L) at early sign.":
    "ஆரம்ப அறிகுறியில் மேன்கோசெப் (2 கி/லி) அல்லது குளோரோதலோனில் (2 கி/லி) தெளிக்கவும்.",
  "If severe, apply Difenoconazole 25% EC (0.5 ml/L) or Azoxystrobin.":
    "தீவிர பாதிப்பு இருப்பின், டைபினோகோனசோல் 25% EC (0.5 மி.லி/லி) அல்லது அசோக்சிஸ்ட்ரோபின் தெளிக்கவும்.",
  "Use certified disease-free seeds, maintain plant spacing for good airflow, and mulch around plants to prevent soil splash.":
    "நோய் தாக்காத சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும், செடிகளுக்கு இடையே நல்ல காற்றோட்டம் பேணவும், நிலப்போர்வை அமைக்கவும்.",

  // Tomato Late Blight
  "Destroy infected plants immediately; do not compost.":
    "பாதிக்கப்பட்ட செடிகளை உடனே பிடுங்கி அழிக்கவும்; மட்கும் உரக் குழியில் போட வேண்டாம்.",
  "Avoid overhead watering and avoid working in wet foliage.":
    "தெளிப்பு நீர் பாசனத்தைத் தவிர்க்கவும்; இலைகளில் ஈரம் இருக்கும்போது களப்பணிகளைத் தவிர்க்கவும்.",
  "Foliar spray with Bacillus subtilis formulations.":
    "பேசில்லஸ் சப்டிலிஸ் போன்ற நன்மை தரும் நுண்ணுயிர் தெளிப்புகளை பயன்படுத்தவும்.",
  "Copper hydroxide organic formulations.":
    "காப்பர் ஹைட்ராக்சைடு போன்ற இயற்கை பூஞ்சைக் கொல்லிகளைத் தெளிக்கவும்.",
  "Prophylactic spray with Metalaxyl + Mancozeb (2 g/L).":
    "முன்னெச்சரிக்கையாக மெட்டலாக்சில் + மேன்கோசெப் (2 கி/லி) தெளிக்கவும்.",
  "Cymoxanil + Mancozeb or Dimethomorph during active outbreaks.":
    "தீவிரமாக பரவும் போது சைமாக்சனில் + மேன்கோசெப் அல்லது டைமெத்தோமார்ப் மருந்தை தெளிக்கவும்.",
  "Plant resistant cultivars, monitor weather during cool wet periods, and destroy volunteer tomato and potato plants.":
    "நோய் எதிர்ப்பு ரகங்களை பயிரிடவும், குளிர்ந்த மழைக்காலங்களில் உன்னிப்பாக கண்காணிக்கவும்.",

  // Rice Brown Spot & Blast
  "Correct potassium and silicon deficiencies; avoid severe drought stress.":
    "பொட்டாசியம் மற்றும் சிலிக்கான் சத்து பற்றாக்குறையை நிவர்த்தி செய்யவும்; பயிர் வறட்சி அடையாமல் பாதுகாக்கவும்.",
  "Seed treatment with Trichoderma viride (4 g/kg seed).":
    "டிரைக்கோடெர்மா விரிடி கொண்டு விதை நேர்த்தி செய்யவும் (1 கிலோ விதைக்கு 4 கிராம்).",
  "Spray Carbendazim + Mancozeb (2 g/L) or Tricyclazole (1 g/L).":
    "கார்பென்டாசிம் + மேன்கோசெப் (2 கி/லி) அல்லது டிரைசைக்ளசோல் (1 கி/லி) தெளிக்கவும்.",
  "Soil testing and balanced NPK + Zinc fertilization; avoid soil moisture stress.":
    "மண் பரிசோதனை செய்து சமச்சீர் தழை, மணி, சாம்பல் மற்றும் துத்தநாக உரங்களை இடவும்.",

  // Bacterial Leaf Spot
  "Rotate crops with non-host species for at least one year.":
    "குறைந்தது ஒரு வருடத்திற்கு மாற்று பயிர் சாகுபடி செய்யவும்.",
  "Copper oxychloride (2.5 g/L) + Streptocycline (100 ppm/L).":
    "காப்பர் ஆக்சிகுளோரைடு (2.5 கி/லி) உடன் ஸ்ட்ரெப்டோமைசின் (100 பிபிஎம்) கலந்து தெளிக்கவும்.",
  "Avoid handling wet plants to prevent bacterial spread.":
    "பாக்டீரியா பரவுவதைத் தடுக்க ஈரமான தாவரங்களை கையாளுவதைத் தவிர்க்கவும்."
};

/**
 * Translates an advice/treatment text to Tamil if the current language is Tamil.
 * If text is already in Tamil (e.g. from Gemini Vision), returns the original string.
 */
export function translateTreatment(text: string, isTamil: boolean): string {
  if (!text || !isTamil) return text;
  
  // If the text already has Tamil Unicode characters, return as is
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return text;
  }

  // Exact match from lookup table
  if (TREATMENT_TRANSLATIONS[text]) {
    return TREATMENT_TRANSLATIONS[text];
  }

  // Substring or prefix matching
  for (const [enKey, taVal] of Object.entries(TREATMENT_TRANSLATIONS)) {
    if (text.includes(enKey) || enKey.includes(text)) {
      return taVal;
    }
  }

  return text;
}

export const TASK_TYPE_TA: Record<string, string> = {
  sowing: 'விதைப்பு', irrigation: 'நீர்ப்பாசனம்', fertilization: 'உரமிடல்',
  pest_inspection: 'பூச்சி ஆய்வு', harvesting: 'அறுவடை', other: 'மற்றவை',
};
const CROP_TA: Record<string, string> = {
  tomato: 'தக்காளி', potato: 'உருளைக்கிழங்கு', rice: 'நெல்', corn: 'மக்காச்சோளம்', maize: 'மக்காச்சோளம்',
  pepper: 'மிளகாய்', apple: 'ஆப்பிள்', grape: 'திராட்சை', wheat: 'கோதுமை', cotton: 'பருத்தி',
};
const COND_TA: Record<string, string> = {
  healthy: 'ஆரோக்கியம்', 'early blight': 'முன்கூட்டிய கருகல் நோய்', 'late blight': 'பின்பருவ கருகல் நோய்',
  'bacterial spot': 'பாக்டீரியா இலைப்புள்ளி', 'leaf mold': 'இலை பூஞ்சை', 'leaf spot': 'இலைப்புள்ளி',
  'septoria leaf spot': 'செப்டோரியா இலைப்புள்ளி', 'yellow leaf curl virus': 'மஞ்சள் இலை சுருள் வைரஸ்',
  'mosaic virus': 'மொசைக் வைரஸ்', 'leaf blast': 'குலைநோய்', 'brown spot': 'பழுப்புப் புள்ளி',
};
/** "Tomato___Early_blight" -> "தக்காளி - முன்கூட்டிய கருகல் நோய்" in Tamil mode */
export function translateLabel(label: string, isTamil: boolean): string {
  const parts = label.split('___').map(p => p.replace(/_/g, ' ').trim());
  if (!isTamil) return parts.join(' - ');
  const out = parts.map((p, i) => {
    const k = p.toLowerCase();
    return (i === 0 ? CROP_TA[k] : COND_TA[k]) || COND_TA[k] || CROP_TA[k] || p;
  });
  return out.join(' - ');
}

const TASK_TITLE_TA: Record<string, string> = {
  'Drip fertigation with potassium nitrate': 'பொட்டாசியம் நைட்ரேட்டுடன் சொட்டு நீர் உரமிடல்',
  'Scout lower leaves for early blight target spots': 'முன்கூட்டிய கருகல் புள்ளிகளுக்காக கீழ் இலைகளை ஆய்வு செய்யவும்',
  'Water depth regulation before panicle emergence': 'கதிர் வெளிவருவதற்கு முன் நீர் மட்டத்தை சீராக்கவும்',
};
export function translateTask(title: string, isTamil: boolean): string {
  return isTamil ? TASK_TITLE_TA[title] || translateTreatment(title, true) : title;
}
