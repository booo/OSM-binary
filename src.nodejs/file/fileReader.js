var fs = require('fs');


var Schema = require('protobuf_for_node').Schema;

var schema = new Schema(fs.readFileSync('../../src/fileformat.desc'));

console.log(schema);
var blob = schema['OSMPBF.Blob'];
console.log(blob);

var blobHeader = schema['OSMPBF.BlobHeader'];
console.log(blobHeader);
var fileName = './berlin.osm.pbf';

var blob = schema['OSMPBF.Blob'];

blob.prototype.zlibData = function() {
	return null;
};

blob.prototype.lzmaData = function() {
	return null;
}

var fs = require('fs');
//fs.open(fileName,'r',start);
var fd;
var blobHeaderSizeCallback = function(error, bytesRead, buffer){
	if(error) {
		console.log(error);
	}
	else {
		if(bytesRead == 4) {
			console.log(buffer);
			var i;
			var	blobHeaderSize = 0;
			for(i=1;i<4;i++) {
				console.log(buffer[i]);
				blobHeaderSize <<= 8;
				blobHeaderSize |= buffer[i];
				console.log("Bla: " + blobHeaderSize);
			}
			var tmp = new Buffer(blobHeaderSize);
			//fs.read(fd,tmp,0,blobHeaderSize,null,blobHeaderCallback);
			fs.read(fd, tmp, 0, blobHeaderSize, null, function(error, bytesRead, buffer) {
				if(bytesRead == blobHeaderSize)	{
					console.log(blobHeader.parse(buffer));
					var aBlobHeader = blobHeader.parse(buffer);
					var tmp = new Buffer(aBlobHeader.datasize);
					fs.read(fd,tmp,0,aBlobHeader.datasize,null,function(error, bytesRead, buffer){
						if(error) {
							console.log(error);	
						}
						else {
							if(bytesRead == aBlobHeader.datasize) {
								var aBlob = blob.parse(buffer);
								console.log(aBlob);
								var data = aBlob.raw;
							    if(!data) {
									if(aBlob.zlibData) {
										data = require('zlib').inflate(aBlob.zlibData);
											
										//var gunzip = new require('compress').Gunzip();
										//gunzip.write(aBlob.zlibData, function(error, data) {
										//	console.log(data);
										//});
									} 
									else if(aBlob.lzmaData) {}	
									else {
										//var bunzip = new require('compress').Bunzip();
										//bunzip.write(aBlob.bzipData2, function(error, data) {	
										//});	
									}	
								}	
									
								console.log(data);	
							}
							else {
								console.log('bytesRead != aBlobHeader.datasize');
							}	
						}		
					});		
				}
				else {
					console.log('bytesRead != blobHeaderSize');	
				}
					});
		}
		else {
			console.log('could not read blobHeaderSize');	
		}
	}
};

var start = function(err, fd2) {
	var tmp = new Buffer(4);
	if(err) {
		console.log(err);
		return;	
	}
	else {
		fd=fd2;
		fs.read(fd,tmp,0,4,null,blobHeaderSizeCallback);	
	}	
};
var blobHeaderCallback = function(error, bytesRead, buffer) {
	
}
fs.open(fileName,'r',start);
