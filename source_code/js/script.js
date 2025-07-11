$(document).ready(function() {

    // Define Constants with the Default Values
    const floors = 10;
    const elevators = 5;
    const queue = [];
    const elevatorsState = Array.from({ length: elevators }, () => ({ floor: 0, busy: false }));
    
    /**
     * Initialize the elevator system.
     * Create the floors and elevators.
     * @returns {void}
     */
    function initElevatorSystem() {
        for (let i = floors - 1; i >= 0; i--) {
            $('#elevator-system tbody').append(`
                <tr data-floor="${i}">
                    <td>${i}</td>
                    <td><button class="call" data-floor="${i}">Call</button><span class="duration"></span></td>
                    ${Array.from({ length: elevators }, (_, index) => `
                        <td>
                            <div class="elevator-container">
                                <div class="elevator" data-elevator-index="${index}" style="top: ${i * 60}px;">
                                    <img src="images/elevator.svg" alt="Elevator Icon">
                                </div>
                            </div>
                        </td>
                    `).join('')}
                </tr>
            `);
        }
    }

    /**
     * Call the elevator system initialization.
     */
    initElevatorSystem();

    /**
     * Handle the call button click event.
     * Add the floor to the queue and process it.
     * @param {Event} event
     * @returns {void}
     */
    $('.call').click(function() {
        const floor = $(this).data('floor');
        $(this).removeClass('call').addClass('waiting').text('Waiting');
        $(this).siblings('.duration').text(''); // Clear previous duration
        queue.push(floor);
        processQueue();
    });

    /**
     * Process the queue and assign the elevator to the next floor.
     * @returns {void}
     */
    function processQueue() {
        if (queue.length > 0) {
            const floor = queue.shift();
            assignElevator(floor);
        }
    }

    /**
     * Assign the elevator to the closest floor.
     * If no elevator is free, add the floor to the queue.
     * @param {number} floor
     * @returns {void}
     */
    function assignElevator(floor) {
        let closestElevatorIndex = findClosestElevator(floor);
        if (closestElevatorIndex !== -1) {
            moveElevator(closestElevatorIndex, floor);
        } else {
            queue.push(floor); // Re-add to queue if no elevator is free
        }
    }

    /**
     * Find the closest elevator to the given floor.
     * @param {number} floor
     * @returns {number}
     */
    function findClosestElevator(floor) {
        let closestElevatorIndex = -1;
        let closestDistance = Infinity;

        elevatorsState.forEach((elevator, index) => {
            if (!elevator.busy) {
                const distance = Math.abs(elevator.floor - floor);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestElevatorIndex = index;
                }
            }
        });

        return closestElevatorIndex;
    }

    /**
     * Move the elevator to the given floor.
     * @param {number} index
     * @param {number} floor
     * @returns {void}
     */
    function moveElevator(index, floor) {
        const elevatorCell = $(`.elevator[data-elevator-index="${index}"]`);
        const startFloor = elevatorsState[index].floor;
        const targetPosition = -floor * 60; // Move up by 60px per floor
        const duration = Math.abs(startFloor - floor) * 500; // Duration based on distance

        elevatorsState[index].busy = true;
        elevatorsState[index].floor = floor;

        const startTime = Date.now(); // Record start time

        elevatorCell.removeClass('arrived').addClass('moving');
        elevatorCell.css('transform', `translateY(${targetPosition}px)`);

        setTimeout(() => {
            const actualDuration = ((Date.now() - startTime) / 1000).toFixed(2); // Calculate actual duration
            elevatorCell.removeClass('moving').addClass('arrived');
            elevatorCell.find('.doors').addClass('open');
            new Audio('ding.mp3').play();
            $(`#elevator-system tbody tr[data-floor="${floor}"] .duration`).text(`Arrival Time: ${actualDuration}s`);
            setTimeout(() => {
                elevatorCell.removeClass('arrived');
                elevatorCell.find('.doors').removeClass('open');
                $(`#elevator-system tbody tr[data-floor="${floor}"] button.waiting`)
                    .removeClass('waiting').addClass('call').text('Call');
                elevatorsState[index].busy = false;
                processQueue();
            }, 4000); // Time the door open stays
        }, duration); // Duration of the movement animation
    }
});