//import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
//import { wishlistAPI } from '../api/wishlistApi';
//import { WishlistResponseDto, WishlistItemResponseDto } from '../types/wishlist.types';
//import { useAuth } from './AuthContext';

//interface WishlistContextType {
//    wishlist: WishlistResponseDto | null;
//    wishlistItems: WishlistItemResponseDto[];
//    addToWishlist: (bookId: number) => Promise<void>;
//    removeFromWishlist: (bookId: number) => Promise<void>;
//    loading: boolean;
//    refreshWishlist: () => Promise<void>;
//}

//const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

//export const WishlistProvider = ({ children }: { children: ReactNode }) => {
//    const [wishlist, setWishlist] = useState<WishlistResponseDto | null>(null);
//    const [loading, setLoading] = useState(false);
//    const { isAuthenticated } = useAuth();

//    const refreshWishlist = async () => {
//        if (!isAuthenticated) return;

//        setLoading(true);
//        try {
//            const response = await wishlistAPI.getWishlist();
//            setWishlist(response.data);
//        } catch (error) {
//            console.error("Failed to load wishlist", error);
//        } finally {
//            setLoading(false);
//        }
//    };

//    const addToWishlist = async (bookId: number) => {
//        try {
//            await wishlistAPI.addToWishlist(bookId);
//            await refreshWishlist(); // Refresh after add
//        } catch (error) {
//            console.error("Failed to add to wishlist", error);
//            throw error;
//        }
//    };

//    const removeFromWishlist = async (bookId: number) => {
//        try {
//            await wishlistAPI.removeFromWishlist(bookId);
//            await refreshWishlist(); // Refresh after remove
//        } catch (error) {
//            console.error("Failed to remove from wishlist", error);
//            throw error;
//        }
//    };

//    // Load wishlist when user logs in
//    useEffect(() => {
//        if (isAuthenticated) {
//            refreshWishlist();
//        } else {
//            setWishlist(null);
//        }
//    }, [isAuthenticated]);

//    return (
//        <WishlistContext.Provider value={{
//            wishlist,
//            wishlistItems: wishlist?.items || [],
//            addToWishlist,
//            removeFromWishlist,
//            loading,
//            refreshWishlist
//        }}>
//            {children}
//        </WishlistContext.Provider>
//    );
//};

//export const useWishlist = () => {
//    const context = useContext(WishlistContext);
//    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
//    return context;
//};