import _ from 'lodash';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSound from 'use-sound';

import coinsFx_1 from '../../assets/audio/money_1.wav';
import coinsFx_2 from '../../assets/audio/money_2.mp3';
import coinsFx_3 from '../../assets/audio/money_3.mp3';
// import coinsFx_4 from '../../assets/audio/coin_1.mp3';
// import coinsFx_5 from '../../assets/audio/coin_2.mp3';
// import coinsFx_6 from '../../assets/audio/coin_3.mp3';
import coinsFx_6 from '../../assets/audio/coin-1v3.mp3';

const DashboardNotifier = () => {
    const soundOn = useSelector((state) => state.dashboards.sound);
    const dashboardData = useSelector((state) => state.dashboards.data);

    const [ play1 ] = useSound(coinsFx_1);
    const [ play2 ] = useSound(coinsFx_2);
    const [ play3 ] = useSound(coinsFx_3);
    // const [ play4 ] = useSound(coinsFx_4);
    // const [ play5 ] = useSound(coinsFx_5);
    const [ play6 ] = useSound(coinsFx_6);

    const sounds = [play1, play2, play3, play6];

    useEffect(() => soundOn ? () => sounds[_.random(0, sounds.length-1)]() : undefined, [dashboardData, soundOn]);

    return <div className="notifier"></div>;
}

export default DashboardNotifier;