import requests, os
# import imageio
from io import BytesIO

# def download_and_convert_webp_to_gif(webp_url, output_path):
#     try:
#         # Download the WEBP image
#         response = requests.get(webp_url)
#         response.raise_for_status()  # Check if the request was successful

#         # Open the image using imageio
#         webp_image = imageio.mimread(BytesIO(response.content), format='webp')

#         # Save the image as GIF
#         imageio.mimsave(output_path, webp_image, format='GIF', duration=0.1)
#         print(f"Successfully converted and saved to {output_path}")
#     except Exception as error:
#         print(f"An error occurred: {error}")


# def optimize_gif(input_path, output_path): 
#     image = Image.open(input_path) 
#     image.save(output_path, optimize=True)

def fetch_gifs(fmt, term, rating, limit, offset, bundle):
    try:
        print(fmt)
        API_KEY = os.getenv('GIPHY_API_KEY')
        URL = ''
        if fmt == 'Gifs' or fmt == 'Stickers':
            if fmt == 'Gifs':
              fmt = 'gifs'
            elif fmt == 'Stickers':
              fmt = 'stickers'
        
            URL = f'https://api.giphy.com/v1/{fmt}/search?api_key={API_KEY}&q={term}&rating={rating}&limit={limit}&offset={offset}&bundle={bundle}'
        
        elif fmt == "Emoji":
            URL = f'https://api.giphy.com/v2/emoji?api_key={API_KEY}&limit={limit}&offset={offset}'
  
        response = requests.get(f"{URL}")

        if response.status_code == 200:
            data = response.json()
            gifs = data['data']
            links = []
            for gif in gifs:
                links.append(f"https://i.giphy.com/{gif['id']}.webp")
                # download_and_convert_webp_to_gif(f"https://i.giphy.com/{gif['id']}.webp", f"gifs/gif_{gif['id']}.gif")
            return links
        else:
            print(f"Failed to fetch GIFs: {response.status_code}")
            return []
    except Exception as error:
        print(f"An error occurred: {error}")
        return []


