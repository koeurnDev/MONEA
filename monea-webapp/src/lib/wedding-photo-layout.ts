export const getWeddingPhotoSlotAspectRatio = (index: number): number => {
    if ([1, 5, 6].includes(index)) return 16 / 9;
    return 3 / 4;
};
