#import <Foundation/Foundation.h>
#if __has_include(<VoskSpec/VoskSpec.h>)
#import <VoskSpec/VoskSpec.h>
#endif
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface Vosk : NativeVoskSpecBase <NativeVoskSpec>
#else
@interface Vosk : RCTEventEmitter <RCTBridgeModule>
#endif

@end

NS_ASSUME_NONNULL_END
