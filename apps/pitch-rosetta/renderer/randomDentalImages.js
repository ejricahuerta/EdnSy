const DENTAL_IMAGES_3X2 = [
  "/images/3x2/dental-asian-man-3x2.jpg",
  "/images/3x2/dental-checkup-smile-3x2.jpg",
  "/images/3x2/dental-cleaning-3x2.jpg",
  "/images/3x2/dental-cleaning-smile-3x2.jpg",
  "/images/3x2/dental-cleaning-woman-3x2.jpg",
  "/images/3x2/dental-eye-protector-3x2.jpg",
  "/images/3x2/dental-smile-asian-3x2.jpg",
];

const DENTAL_IMAGES_9X16 = [
  "/images/9x16/dental-chair-9x16.jpg",
  "/images/9x16/dental-cleaning-closeup-9x16.jpg",
  "/images/9x16/dental-machine-9x16.jpg",
  "/images/9x16/dental-machine-backdrop-9x16.jpg",
  "/images/9x16/dental-xray-9x16.jpg",
  "/images/9x16/dental-xray-man-9x16.jpg",
];

function listForRatio(ratio) {
  return ratio === "9x16" ? DENTAL_IMAGES_9X16 : DENTAL_IMAGES_3X2;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function isAllowedDentalImageUrl(value) {
  return (
    typeof value === "string" &&
    (value.startsWith("/images/3x2/") || value.startsWith("/images/9x16/"))
  );
}

export function randomDentalImageByRatio(ratio) {
  return pickRandom(listForRatio(ratio));
}

export function createPageDentalImageAllocator() {
  const used = {
    "3x2": new Set(),
    "9x16": new Set(),
  };

  return function allocate(ratio, preferred) {
    const key = ratio === "9x16" ? "9x16" : "3x2";
    const list = listForRatio(key);
    const usedSet = used[key];

    if (isAllowedDentalImageUrl(preferred) && !usedSet.has(preferred)) {
      usedSet.add(preferred);
      return preferred;
    }

    const remaining = list.filter((item) => !usedSet.has(item));
    const chosen = remaining.length ? pickRandom(remaining) : pickRandom(list);
    usedSet.add(chosen);
    return chosen;
  };
}

export function resolveDentalImage(preferred, ratio, allocator) {
  if (typeof allocator === "function") return allocator(ratio, preferred);
  if (isAllowedDentalImageUrl(preferred)) return preferred;
  return randomDentalImageByRatio(ratio);
}
