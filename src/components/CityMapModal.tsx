import { useState } from 'react';
import Modal from './Modal';

const ROADS = [
  {
    name: 'Anna Salai (Mount Road)',
    blurb:
      "The city's spine — a dead-straight diagonal from Fort St. George to Guindy. If you're lost, find Anna Salai and you're un-lost.",
  },
  {
    name: 'EVR Periyar Salai (Poonamallee High Road)',
    blurb:
      'The big east–west artery past Chennai Central. Hospitals, colleges and a permanent sea of buses.',
  },
  {
    name: 'Rajiv Gandhi Salai (OMR)',
    blurb:
      'The IT corridor running south. Tech parks, food courts and every techie you know stuck in its traffic.',
  },
  {
    name: 'East Coast Road (ECR)',
    blurb:
      'The scenic one — hugs the coast all the way to Mahabalipuram and Pondy. Weekend drives live here.',
  },
  {
    name: 'GST Road (NH-45)',
    blurb:
      'South-west out of the city: airport, Tambaram and beyond. Suburban trains run parallel, often faster.',
  },
  {
    name: 'Kamarajar Salai (Beach Road)',
    blurb: 'The Marina stretch — university, lighthouse and the sea on one side for 6 glorious km.',
  },
  {
    name: 'Inner Ring Road / 100 Feet Road',
    blurb:
      'The bypass that stitches the arteries together — and home to CMBT, the mothership of bus termini.',
  },
];

export default function CityMapModal({ onClose }: { onClose: () => void }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <Modal titleId="citymap-title" onClose={onClose}>
      <h2 id="citymap-title">City map, for geeks 🗺️</h2>
      <p className="modal-intro">
        Chennai radiates from Fort St. George — learn these arteries and you can navigate the whole
        city without opening Maps.
      </p>
      {imgOk && (
        <img
          className="modal-map"
          src={`${import.meta.env.BASE_URL}maps/city-roads.jpg`}
          alt="Map of Chennai's main roads"
          onError={() => setImgOk(false)}
        />
      )}
      <ul className="roads-list">
        {ROADS.map((road) => (
          <li key={road.name}>
            <strong>{road.name}</strong>
            <p>{road.blurb}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
