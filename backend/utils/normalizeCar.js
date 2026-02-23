function normalizeCar(car) {
  if (!car) return car;
  // Convert mongoose document to plain object if needed
  const c = typeof car.toObject === 'function' ? car.toObject() : JSON.parse(JSON.stringify(car));

  // Ensure container objects exist
  c.car_details = c.car_details || {};
  c.owner_details = c.owner_details || {};

  // Normalize insurance: string -> { policyNumber }
  if (typeof c.car_details.insurance === 'string' || typeof c.car_details.insurance === 'number') {
    c.car_details.insurance = { policyNumber: String(c.car_details.insurance) };
  }
  c.car_details.insurance = c.car_details.insurance || {};

  // Normalize rc_book: string -> { image }
  if (typeof c.car_details.rc_book === 'string' || typeof c.car_details.rc_book === 'number') {
    c.car_details.rc_book = { image: String(c.car_details.rc_book) };
  }
  c.car_details.rc_book = c.car_details.rc_book || {};

  // Normalize fine_details to an array of objects
  if (!Array.isArray(c.fine_details)) {
    if (c.fine_details == null) {
      c.fine_details = [];
    } else if (typeof c.fine_details === 'string' || typeof c.fine_details === 'number') {
      const amount = Number(c.fine_details);
      c.fine_details = [{ amount: isNaN(amount) ? 0 : amount, description: '', date: c.updatedAt || new Date() }];
    } else if (typeof c.fine_details === 'object') {
      c.fine_details = [c.fine_details];
    } else {
      c.fine_details = [];
    }
  }

  // Normalize users to array
  if (!Array.isArray(c.users)) {
    if (c.users == null) c.users = [];
    else if (typeof c.users === 'object') c.users = [c.users];
    else c.users = [];
  }

  // Normalize safety_logs
  c.safety_logs = c.safety_logs || {};
  c.safety_logs.emotion_alerts = Array.isArray(c.safety_logs.emotion_alerts) ? c.safety_logs.emotion_alerts : [];
  c.safety_logs.drowsiness_events = Array.isArray(c.safety_logs.drowsiness_events) ? c.safety_logs.drowsiness_events : [];

  // Driving data fallback
  c.driving_data = c.driving_data || { speed: 0, kilometers: 0, petrol: 0, oil: 0 };

  return c;
}

module.exports = normalizeCar;
