function updateSegmentTitle(currentTime) {
  segments.find((segment) => currentTime >= segment.start && currentTime <= segment.end);
}

function makeSegmentButton(segment) {
  const segmentButton = document.createElement("button");
  segmentButton.classList.add("segment-button");
  segmentButton.textContent = segment.title;
  segmentButton.onclick = function () {
    scrollToSegment(segment.start);
  };
  document.body.appendChild(segmentButton);
  return segmentButton;
}

function makeControlBar(segment, startPosition, endPosition) {
  const marker = document.createElement("div");
  marker.classList.add("vjs-chapter-marker");
  if (segment.end) {
    marker.style.left = `${endPosition}%`;
  }

  const overlay = document.createElement("div");
  overlay.classList.add("vjs-chapter-overlay");
  overlay.style.left = `${startPosition}%`;
  overlay.style.width = `${endPosition - startPosition}%`;

  const label = document.createElement("div");
  label.classList.add("vjs-chapter-label");
  label.textContent = segment.title;
  overlay.appendChild(label);

  const controlBar = player.el().querySelector(".vjs-progress-control");
  controlBar.appendChild(marker);
  controlBar.appendChild(overlay);

  overlay.addEventListener("mousemove", function (event) {
    const offsetX = event.offsetX;
    const labelWidth = label.clientWidth;
    const maxX = overlay.clientWidth - labelWidth;
    const labelPosition = offsetX - labelWidth / 2;
    label.style.left = `${labelPosition}px`;
  });

  return controlBar;
}

function scrollToSegment(startTime) {
  player.currentTime(startTime);
  player.play();
}

player.on("error", function () {
  console.error("Video Player Error: ", player.error());
});

player.on("timeupdate", function () {
  const currentTime = player.currentTime();
  updateSegmentTitle(currentTime);
});

player.ready(function () {
  player.on("loadedmetadata", function () {
    const duration = player.duration();
    segments.forEach((segment) => {
      const segmentButton = makeSegmentButton(segment);

      const startPosition = (segment.start / duration) * 100;
      let endPosition;
      if (segment.end) {
        endPosition = (segment.end / duration) * 100;
      } else {
        endPosition = 100;
      }

      const controlBar = makeControlBar(segment, startPosition, endPosition);
    });

    player.on("play", function () {
      hideTooltips();
    });

    player.on("pause", function () {
      const currentTime = player.currentTime();
      showCurrentTooltips(currentTime);
    });

    function showCurrentTooltips(currentTime) {
      hideTooltips();
      const currentSegment = segments.find(
        (segment) => currentTime >= segment.start && currentTime <= segment.end
      );
      if (currentSegment) {
        const tooltips = document.querySelectorAll(".vjs-chapter-label");
        tooltips.forEach((tooltip) => {
          if (tooltip.textContent === currentSegment.title) {
            tooltip.classList.remove("hide");
          }
        });
      }
    }

    function hideTooltips() {
      const tooltips = document.querySelectorAll(".vjs-chapter-label");
      tooltips.forEach((tooltip) => {
        tooltip.classList.add("hide");
      });
    }
  });
});
