import { useRef } from 'react';
import { Animated } from 'react-native';
import { useNavCollapse } from '../contexts/NavCollapseContext';

export const useScrollCollapse = () => {
  const { setCollapsed } = useNavCollapse();
  const lastY = useRef(0);
  const lastTrigger = useRef(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        if (y < 40) {
          setCollapsed(false);
          lastY.current = y;
          return;
        }
        const delta = y - lastY.current;
        const now = Date.now();
        if (now - lastTrigger.current < 250) {
          lastY.current = y;
          return;
        }
        if (delta > 12) {
          setCollapsed(true);
          lastTrigger.current = now;
        }
        if (delta < -8) {
          setCollapsed(false);
          lastTrigger.current = now;
        }
        lastY.current = y;
      },
    },
  );

  return { onScroll };
};
