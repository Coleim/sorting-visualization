

let pixels = []
const DISPLAY_SCALE = 5;

const img = new Image();
img.crossOrigin = "Anonymous"; // Important for CORS
img.onload = function () {
  // Image is ready
  const canvas = document.getElementById('origin');

  canvas.width = img.width * 0.005 // 0.01;
  canvas.height = img.height * 0.005 //  0.01;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rawPixels = imageData.data; // Uint8ClampedArray
  console.log(rawPixels)

  let idxCount = 0
  // parse pixels and put them as array of pixels
  for (let idx = 0; idx < rawPixels.length; idx += 4) {
    pixels.push({
      idx: idxCount,
      r: rawPixels[idx],
      g: rawPixels[idx + 1],
      b: rawPixels[idx + 2],
      a: rawPixels[idx + 3]
    })
    idxCount++
  }

  console.log(" pixels: ", pixels)
  drawImageInCanva('upscaled', pixels, canvas.width, canvas.height)
  shuffle(pixels)
  drawImageInCanva('mixed', pixels, canvas.width, canvas.height)

  drawImageInCanva('bubble', [...pixels], canvas.width, canvas.height)
  drawImageInCanva('insertion', [...pixels], canvas.width, canvas.height)
  drawImageInCanva('selection', [...pixels], canvas.width, canvas.height)


};
img.src = "./mario.png";



async function sort() {
  const originCanva = document.getElementById('origin')
  const sorted = [...pixels]
  let drawCtx = drawImageInCanva('bubble', sorted, originCanva.width, originCanva.height)
  bubbleSort(drawCtx, sorted, originCanva.width)
  drawImageInCanva('bubble', sorted, originCanva.width, originCanva.height)

  // Insertion sort
  const insertionSorted = [...pixels]
  let instertionDrawCtx = drawImageInCanva('insertion', insertionSorted, originCanva.width, originCanva.height)
  insertionSort(instertionDrawCtx, insertionSorted, originCanva.width)
  drawImageInCanva('insertion', insertionSorted, originCanva.width, originCanva.height)

  // Insertion sort
  const selectionSorted = [...pixels]
  let selectionDrawCtx = drawImageInCanva('selection', selectionSorted, originCanva.width, originCanva.height)
  selectionSort(selectionDrawCtx, selectionSorted, originCanva.width)
  drawImageInCanva('selection', selectionSorted, originCanva.width, originCanva.height)
}


async function selectionSort(imgCtx, array, width) {

  const start = performance.now()
  for (let i = 0; i < array.length; ++i) {
    const current = array[i]
    let minpos = i
    for (let j = i + 1; j < array.length; ++j) {
      const c = array[j]
      if (c.idx < array[minpos].idx) {
        minpos = j
      }
    }
    // swap
    clearPixel(imgCtx, i, width);
    clearPixel(imgCtx, minpos, width);
    array[i] = array[minpos]
    array[minpos] = current
    drawPixel(imgCtx, array[i], i, width);
    drawPixel(imgCtx, array[minpos], minpos, width);
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  const end = performance.now()

  const timespent = end - start

  document.getElementById('selectionTime').textContent = timespent
}

async function insertionSort(imgCtx, array, width) {

  const start = performance.now()

  for (let i = 1; i < array.length; ++i) {
    const elt = array[i]
    let j = i - 1
    // Tout ce qui est plus grand que la cle (elt) , on le shift a droite de 1
    // On met la cle a la position
    while (j >= 0 && elt.idx < array[j].idx) {
      // shift et on regarde 
      clearPixel(imgCtx, j, width);
      clearPixel(imgCtx, j + 1, width);
      array[j + 1] = array[j]
      drawPixel(imgCtx, array[j], j, width);
      drawPixel(imgCtx, array[j + 1], j + 1, width);
      j = j - 1
    }

    clearPixel(imgCtx, j + 1, width);
    array[j + 1] = elt
    drawPixel(imgCtx, array[j + 1], j + 1, width);


    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  const end = performance.now()

  const timespent = end - start

  document.getElementById('insertionTime').textContent = timespent

}


async function bubbleSort(imgCtx, array, width) {
  const start = performance.now()

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j].idx > array[j + 1].idx) {
        // Swap
        clearPixel(imgCtx, j, width);
        clearPixel(imgCtx, j + 1, width);
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        drawPixel(imgCtx, array[j], j, width);
        drawPixel(imgCtx, array[j + 1], j + 1, width);
      }
    }
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  const end = performance.now()
  const timespent = end - start
  document.getElementById('bubbleTime').textContent = timespent
}


function clearPixel(ctx, idx, width) {
  const x = (idx % width) * DISPLAY_SCALE;
  const y = Math.floor(idx / width) * DISPLAY_SCALE;
  ctx.clearRect(x, y, DISPLAY_SCALE, DISPLAY_SCALE);
}


function drawPixel(drawCtx, pixel, idx, width) {
  drawCtx.fillStyle = "rgba(" + pixel.r + "," + pixel.g + "," + pixel.b + "," + pixel.a + ")";
  const x = (idx % width) * DISPLAY_SCALE
  const y = Math.floor(idx / width) * DISPLAY_SCALE
  drawCtx.fillRect(x, y, DISPLAY_SCALE, DISPLAY_SCALE);

}
function drawImageInCanva(id, pixels, width, height) {
  const drawCanvas = document.getElementById(id)
  drawCanvas.width = width * DISPLAY_SCALE
  drawCanvas.height = height * DISPLAY_SCALE
  let drawCtx = drawCanvas.getContext("2d");
  for (let idx = 0; idx < pixels.length; ++idx) {
    const pixel = pixels[idx]
    drawPixel(drawCtx, pixel, idx, width)
  }
  return drawCtx
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap
  }
  return array;
}
