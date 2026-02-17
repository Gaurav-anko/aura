import React, { useEffect, useState } from 'react';

interface StyledRoom {
  id: string;
  room_type: string;
  category: string;
  color: string;
  styled_image_url: string;
  products_count: number;
}

interface StyledRoomsData {
  total_styled_images: number;
  styled_rooms: StyledRoom[];
}

export const StyledRoomsGallery: React.FC = () => {
  const [data, setData] = useState<StyledRoomsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedRoomForShare, setSelectedRoomForShare] = useState<StyledRoom | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');

  useEffect(() => {
    // Fetch the styled room images data
    fetch('/api/data/styled_room_images.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading styled rooms:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading styled room images...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.styled_rooms || data.styled_rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load styled room images</p>
          <p className="text-gray-600 text-sm">Please ensure the backend server is running</p>
        </div>
      </div>
    );
  }

  // Get unique room types and colors for filters
  const roomTypes = ['All', ...Array.from(new Set(data.styled_rooms.map(r => r.room_type)))];
  const colors = ['All', ...Array.from(new Set(data.styled_rooms.map(r => r.color)))];

  // Filter rooms based on selections
  const filteredRooms = data.styled_rooms.filter(room => {
    const matchesRoom = selectedRoom === 'All' || room.room_type === selectedRoom;
    const matchesColor = selectedColor === 'All' || room.color === selectedColor;
    return matchesRoom && matchesColor;
  });

  // Generate share content
  const generateShareContent = (room: StyledRoom) => {
    const title = `Check out this ${room.color} ${room.category} for your ${room.room_type}!`;
    const defaultDescription = `Get inspired by this stunning ${room.room_type.toLowerCase()} design featuring ${room.products_count} ${room.category.toLowerCase()} products. ${room.color} color theme. #HomeDecor #InteriorDesign #${room.room_type.replace(/\s+/g, '')}Ideas`;
    const url = window.location.href;
    const imageUrl = room.styled_image_url;
    
    return { title, description: defaultDescription, url, imageUrl };
  };

  // Open share modal and initialize custom message
  const openShareModal = (room: StyledRoom) => {
    const { description } = generateShareContent(room);
    setCustomMessage(description);
    setSelectedRoomForShare(room);
  };

  const shareToSocialMedia = (platform: string, room: StyledRoom) => {
    const { title, url, imageUrl } = generateShareContent(room);
    const description = customMessage || generateShareContent(room).description;
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedUrl = encodeURIComponent(url);
    const encodedImage = encodeURIComponent(imageUrl);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedDescription}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so copy to clipboard
        navigator.clipboard.writeText(`${title}\n\n${description}\n\nImage: ${imageUrl}\n\n${url}`)
          .then(() => alert('Content copied to clipboard! Open Instagram and paste to share.'));
        return;
      case 'copy':
        navigator.clipboard.writeText(`${title}\n\n${description}\n\nImage: ${imageUrl}\n\n${url}`)
          .then(() => alert('Link copied to clipboard!'));
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=600');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Share Modal */}
      {selectedRoomForShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoomForShare(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedRoomForShare.styled_image_url} 
                alt={selectedRoomForShare.category}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <button 
                onClick={() => setSelectedRoomForShare(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRoomForShare.category}</h2>
              <div className="flex gap-2 mb-4">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedRoomForShare.room_type}
                </span>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedRoomForShare.color}
                </span>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedRoomForShare.products_count} Products
                </span>
              </div>

              <p className="text-gray-600 mb-6">
                Share this beautiful {selectedRoomForShare.room_type.toLowerCase()} design inspiration with your friends and followers!
              </p>

              {/* Custom Message Area */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-900">✍️ Customize Your Message</label>
                  <span className="text-xs text-gray-500">{customMessage.length} characters</span>
                </div>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add your description, hashtags, and comments..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-sm text-gray-700 placeholder-gray-400"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => setCustomMessage(customMessage + ' #HomeDecor')}
                    className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    #HomeDecor
                  </button>
                  <button
                    onClick={() => setCustomMessage(customMessage + ' #InteriorDesign')}
                    className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    #InteriorDesign
                  </button>
                  <button
                    onClick={() => setCustomMessage(customMessage + ' #HomeInspiration')}
                    className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    #HomeInspiration
                  </button>
                  <button
                    onClick={() => setCustomMessage(customMessage + ` #${selectedRoomForShare.room_type.replace(/\s+/g, '')}`)}
                    className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    #{selectedRoomForShare.room_type.replace(/\s+/g, '')}
                  </button>
                  <button
                    onClick={() => setCustomMessage(customMessage + ` #${selectedRoomForShare.color}`)}
                    className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    #{selectedRoomForShare.color}
                  </button>
                </div>
              </div>

              {/* Social Media Sharing Buttons */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Share on Social Media</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Facebook */}
                  <button
                    onClick={() => shareToSocialMedia('facebook', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-medium">Facebook</span>
                  </button>

                  {/* Twitter */}
                  <button
                    onClick={() => shareToSocialMedia('twitter', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="font-medium">Twitter</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => shareToSocialMedia('linkedin', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="font-medium">LinkedIn</span>
                  </button>

                  {/* Pinterest */}
                  <button
                    onClick={() => shareToSocialMedia('pinterest', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                    </svg>
                    <span className="font-medium">Pinterest</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => shareToSocialMedia('whatsapp', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="font-medium">WhatsApp</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => shareToSocialMedia('telegram', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="font-medium">Telegram</span>
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={() => shareToSocialMedia('instagram', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                    <span className="font-medium">Instagram</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => shareToSocialMedia('copy', selectedRoomForShare)}
                    className="flex items-center gap-3 p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Copy Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 Styled Projects
          </h1>
          <p className="text-gray-600">
            {data.total_styled_images} professionally styled room inspiration images
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {roomTypes.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Theme
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredRooms.length} of {data.total_styled_images} styled rooms
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div style={{maxHeight: 800, overflowY: 'auto'}} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => openShareModal(room)}
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-200 overflow-hidden group">
                <img
                  src={room.styled_image_url}
                  alt={`${room.category} - ${room.color}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Image+Unavailable';
                  }}
                />
                
                {/* Share Icon Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300 bg-white rounded-full p-3 shadow-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </div>
                
                {/* Room Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    {room.room_type}
                  </span>
                </div>

                {/* Color Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-block bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-lg border border-gray-200">
                    {room.color}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {room.category}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium text-gray-900">{room.room_type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Color Theme:</span>
                    <span className="font-medium text-gray-900">{room.color}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Products Available:</span>
                    <span className="font-semibold text-purple-600">{room.products_count}</span>
                  </div>
                </div>

                {/* View Products Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Navigate to products with filters applied
                  }}
                  className="mt-4 w-full bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm"
                >
                  View {room.products_count} Products
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyledRoomsGallery;
