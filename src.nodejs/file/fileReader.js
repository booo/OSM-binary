var fs = require('fs');


var Schema = require('protobuf_for_node').Schema;

var fileSchema = new Schema(fs.readFileSync('../../src/fileformat.desc'));
var osmSchema = new Schema(fs.readFileSync('../../src/osmformat.desc'));

console.log(fileSchema);
var blob = fileSchema['OSMPBF.Blob'];
console.log(blob);

var blobHeader = fileSchema['OSMPBF.BlobHeader'];
console.log(blobHeader);

var blobHeaderBlock = osmSchema['OSMPBF.HeaderBlock'];
var fileName = './berlin.osm.pbf';

var blobPrimitiveBlock = osmSchema['OSMPBF.PrimitiveBlock'];

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
					if(aBlobHeader.indexdata) {
						console.log(indexdata);
					}
					//read a blob from file
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
								if(aBlobHeader.type === 'OSMHeader') {
									var aBlobHeaderBlock = blobHeaderBlock.parse(data);
									console.log(aBlobHeaderBlock);	
								} 
								else if(aBlobHeader.type === 'OSMData') {
									var aBlobPrimitiveBlock = blobPrimitiveBlock.parse(data);	
								}
								else {
									console.log('unsupported BlobHeader.type');	
								}		
								//console.log(data);	
							}
							else {
								console.log('bytesRead != aBlobHeader.datasize');
							}
							//start next interation
							fs.read(fd, new Buffer(4),0,4,null,blobHeaderSizeCallback);	
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
