"""
Image Fetcher Service
Fetches product images from URLs with graceful error handling.
"""

import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def fetch_image_from_url(url: str, timeout: float = 10.0) -> Optional[bytes]:
    """
    Fetch image bytes from a URL.
    
    Args:
        url: The image URL to fetch
        timeout: Request timeout in seconds
        
    Returns:
        Image bytes if successful, None if failed
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=timeout, follow_redirects=True)
            response.raise_for_status()
            return response.content
    except Exception as e:
        logger.warning(f"Failed to fetch image from {url}: {e}")
        return None


async def fetch_product_images(
    products: list[dict],
) -> tuple[list[tuple[dict, bytes]], list[dict]]:
    """
    Fetch images for multiple products.
    
    Args:
        products: List of product dictionaries with IMAGE_URL field
        
    Returns:
        Tuple of:
        - List of (product, image_bytes) tuples for successful fetches
        - List of products that failed to fetch
    """
    successful = []
    failed = []
    
    for product in products:
        image_urls = product.get("IMAGE_URL", [])
        
        # Try to fetch the first available image
        image_bytes = None
        if isinstance(image_urls, list) and len(image_urls) > 0:
            image_bytes = await fetch_image_from_url(image_urls[0])
        elif isinstance(image_urls, str):
            image_bytes = await fetch_image_from_url(image_urls)
        
        if image_bytes:
            successful.append((product, image_bytes))
        else:
            failed.append(product)
            logger.warning(f"Skipping product {product.get('ITEM_ID', 'unknown')} - image fetch failed")
    
    return successful, failed
