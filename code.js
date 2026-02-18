 const ctx = document.getElementById("graph").getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets: [] },
      options: {
        
        scales: {
          x: {
            title: { display: true, text: "Lap" },
            ticks: { color: "#e2e8f0" },
            grid: { color: "#334155" },
           

          },
          y: {
            title: { display: true, text: "Lap Time (s)" },
            ticks: { color: "#e2e8f0" },
            grid: { color: "#334155" },
            ticks: {
                    
                    stepSize: 0.250
                  }
            
           
          }
        },
        plugins: {
          legend: { labels: { color: "#e2e8f0" } },
          tooltip: { enabled: true }
        },
        animation: false
      },
      plugins: [{
        id: "lapLabelsAndHighlight",
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          ctx.save();
          data.datasets.forEach(dataset => {
            const meta = chart.getDatasetMeta(data.datasets.indexOf(dataset));
            if (!meta.data.length) return;

            const minValue = Math.min(...dataset.data);
            const minIndex = dataset.data.indexOf(minValue);

            meta.data.forEach((point, i) => {
              const { x, y } = point.tooltipPosition();
              ctx.font = "12px Arial";
              ctx.fillStyle = "#94a3b8";
              ctx.textAlign = "center";
              ctx.fillText(formatTotalTime(dataset.data[i].toFixed(3)), x, y + 20);

              if (i === minIndex) {
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = "#a855f7";
                ctx.fill();
                ctx.strokeStyle = "#c084fc";
                ctx.lineWidth = 2;
                ctx.stroke();
              }
            });
          });
          ctx.restore();
        }
      }]
    });

    function addStint() {
      const id = Date.now();
      const container = document.getElementById("stintsContainer");
      const stintDiv = document.createElement("div");
      stintDiv.className = "stint-input";
      stintDiv.id = `stint-${id}`;
      stintDiv.innerHTML = `
        <div class="stint-header">
          <input type="text" id="label-${id}" placeholder="Stint label (e.g. Stint A)" />
          <input type="color" id="color-${id}" value="#3b82f6" />
          <button onclick="removeStint(${id})">❌ Remove</button>
        </div>
        <textarea id="data-${id}" placeholder="Enter lap times (e.g. [57.654, 56.840, 56.639])"></textarea>
      `;
      container.appendChild(stintDiv);
    }

    function removeStint(id) {
      document.getElementById(`stint-${id}`).remove();
    }

    function updateChart() {
      const container = document.getElementById("stintsContainer");
      const stints = Array.from(container.children);
      const datasets = [];
      const totalsDiv = document.getElementById("totals");
      totalsDiv.innerHTML = "";

      let maxLaps = 0;

      stints.forEach(stintDiv => {
        const id = stintDiv.id.split("-")[1];
        const label = document.getElementById(`label-${id}`).value || `Stint ${id}`;
        const color = document.getElementById(`color-${id}`).value;
        let data;

        try {
          data = JSON.parse(document.getElementById(`data-${id}`).value);
          if (!Array.isArray(data)) throw "Invalid array";
        } catch {
          alert(`Invalid data for ${label}. Use format [57.654, 56.840, 56.639]`);
          return;
        }

        if (data.length > maxLaps) maxLaps = data.length;

        datasets.push({
          label,
          data,
          borderColor: color,
          backgroundColor: color + "80",
          tension: 0.3,
          fill: false,
          pointRadius: 5,
          borderWidth: 3
        });

        const total = data.reduce((a, b) => a + b, 0);
        const avg = (total / data.length).toFixed(3);
        totalsDiv.innerHTML += `
          <p><strong>${label}</strong> — Total: ${formatTotalTime(total)}, Avg: ${formatTotalTime(avg)} </p>
        `;
      });

      chart.data.labels = Array.from({ length: maxLaps }, (_, i) => i + 1);
      chart.data.datasets = datasets;
      chart.update();
    }

    function clearAll() {
      chart.data.labels = [];
      chart.data.datasets = [];
      chart.update();
      document.getElementById("stintsContainer").innerHTML = "";
      document.getElementById("totals").innerHTML = "";
    }

    function formatTotalTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60).toFixed(3);
      return `${mins} min ${secs} s`;
    }

    // Initialize with one default stint
    addStint();

